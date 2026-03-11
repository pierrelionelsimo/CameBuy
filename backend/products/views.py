from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Produit, Fournisseur, Categorie, Commande,
    CommandeItem, Paiement, Panier, PanierItem, Notification
)
from .serializers import (
    ProduitSerializer, FournisseurSerializer, CategorieSerializer,
    CommandeSerializer, PaiementSerializer,
    PanierSerializer, PanierItemSerializer,
    NotificationSerializer,
)
from .services import MTNMomoService
from .email_service import (
    envoyer_email_validation, envoyer_email_refus,
    envoyer_email_suppression_produit,
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(obj, 'utilisateur') and obj.utilisateur == request.user


# ── Produits ───────────────────────────────────────────────
class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.select_related('categorie', 'fournisseur').all()
    serializer_class = ProduitSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['categorie']
    search_fields    = ['nom', 'description']

    def get_queryset(self):
        qs = Produit.objects.select_related('categorie', 'fournisseur').all()
        cat = self.request.query_params.get('categorie')
        if cat:
            qs = qs.filter(categorie_id=cat)
        return qs

    def perform_create(self, serializer):
        try:
            f = Fournisseur.objects.get(utilisateur=self.request.user)
            serializer.save(fournisseur=f)
        except Fournisseur.DoesNotExist:
            serializer.save()

    def perform_update(self, serializer):
        instance  = self.get_object()
        old_stock = instance.stock
        updated   = serializer.save()
        SEUIL = 5
        if updated.stock <= SEUIL and updated.stock > 0 and old_stock > SEUIL and updated.fournisseur:
            Notification.objects.create(
                destinataire=updated.fournisseur,
                type_notif='stock',
                titre=f'Stock faible — {updated.nom}',
                message=f'Il ne reste que {updated.stock} exemplaire(s) de "{updated.nom}". Pensez à réapprovisionner.',
            )


# ── Fournisseurs ───────────────────────────────────────────
class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Fournisseur.objects.all().select_related('utilisateur')
        return Fournisseur.objects.filter(utilisateur=user)


# ── Catégories ─────────────────────────────────────────────
class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ── Commandes ──────────────────────────────────────────────
class CommandeViewSet(viewsets.ModelViewSet):
    serializer_class   = CommandeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Commande.objects.filter(client=self.request.user).prefetch_related('items__produit')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


# ── Paiements ──────────────────────────────────────────────
class PaiementViewSet(viewsets.ModelViewSet):
    serializer_class   = PaiementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Paiement.objects.filter(commande__client=self.request.user)


# ── Panier ─────────────────────────────────────────────────
class PanierViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        panier, _ = Panier.objects.get_or_create(utilisateur=request.user)
        return Response(PanierSerializer(panier).data)


class PanierItemViewSet(viewsets.ModelViewSet):
    serializer_class   = PanierItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        panier, _ = Panier.objects.get_or_create(utilisateur=self.request.user)
        return PanierItem.objects.filter(panier=panier)

    def perform_create(self, serializer):
        panier, _ = Panier.objects.get_or_create(utilisateur=self.request.user)
        serializer.save(panier=panier)


# ── MTN MoMo ───────────────────────────────────────────────
class MTNMomoDisbursementInitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        montant   = request.data.get('montant')
        numero    = request.data.get('numero')
        reference = request.data.get('reference', 'Commande CAMEBUY')
        if not montant or not numero:
            return Response({'error': 'montant et numero requis'}, status=400)
        try:
            result = MTNMomoService().initiate_disbursement(montant, numero, reference)
            return Response(result)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class MTNMomoDisbursementStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tid = request.query_params.get('transaction_id')
        if not tid:
            return Response({'error': 'transaction_id requis'}, status=400)
        try:
            return Response(MTNMomoService().check_disbursement_status(tid))
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ── Passer commande ✅ ─────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def passer_commande(request):
    items_data = request.data.get('items', [])
    if not items_data:
        return Response({'error': 'Liste articles vide.'}, status=400)

    a_traiter = []
    for item in items_data:
        try:
            produit = Produit.objects.select_related('fournisseur').get(id=item['produit_id'])
        except Produit.DoesNotExist:
            return Response({'error': f'Produit #{item["produit_id"]} introuvable.'}, status=404)
        quantite = int(item.get('quantite', 1))
        if produit.stock < quantite:
            return Response({'error': f'Stock insuffisant pour "{produit.nom}".', 'disponible': produit.stock}, status=400)
        a_traiter.append((produit, quantite))

    commande = Commande.objects.create(client=request.user, statut='en_attente', total=0)
    total = 0
    fournisseurs_touches = {}

    for produit, quantite in a_traiter:
        CommandeItem.objects.create(commande=commande, produit=produit, quantite=quantite)
        produit.stock -= quantite
        produit.save()
        total += float(produit.prix) * quantite
        if produit.fournisseur:
            fid = produit.fournisseur.id
            if fid not in fournisseurs_touches:
                fournisseurs_touches[fid] = {'fournisseur': produit.fournisseur, 'items': []}
            fournisseurs_touches[fid]['items'].append(f'{quantite}× {produit.nom}')

    commande.total = total
    commande.save()
    Paiement.objects.create(commande=commande, montant=total, statut='en_attente')

    for fid, data in fournisseurs_touches.items():
        Notification.objects.create(
            destinataire=data['fournisseur'],
            type_notif='commande',
            titre=f'Nouvelle commande #{commande.id}',
            message=f'Client : {request.user.username}\nArticles : {", ".join(data["items"])}\nTotal : {total:,.0f} FCFA',
        )

    return Response({'message': 'Commande créée', 'commande': CommandeSerializer(commande).data, 'total': total}, status=201)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_commande_statut(request, commande_id):
    try:
        commande = Commande.objects.get(id=commande_id, client=request.user)
    except Commande.DoesNotExist:
        return Response({'error': 'Introuvable.'}, status=404)
    statut = request.data.get('statut')
    if statut not in ['payee', 'en_attente', 'annulee', 'livree']:
        return Response({'error': 'Statut invalide.'}, status=400)
    commande.statut = statut
    commande.save()
    if statut == 'payee':
        Paiement.objects.filter(commande=commande).update(statut='complete')
    return Response({'message': f'Commande #{commande_id} → {statut}'})


# ══════════════════════════════════════════════════════════
# ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_fournisseurs(request):
    statut = request.query_params.get('statut')
    qs = Fournisseur.objects.select_related('utilisateur').order_by('-created_at')
    if statut:
        qs = qs.filter(statut=statut)
    return Response(FournisseurSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_valider_fournisseur(request, fournisseur_id):
    fournisseur = get_object_or_404(Fournisseur, id=fournisseur_id)
    action = request.data.get('action')
    note   = request.data.get('note', '').strip()
    # mot_de_passe_clair : optionnel, envoyé par le frontend si l'admin veut le rappeler
    mot_de_passe = request.data.get('mot_de_passe', '').strip()

    actions_map = {
        'valider':   ('valide',   True,  '✅ Votre compte a été validé !',
                      f'Félicitations {fournisseur.nom} ! Votre compte fournisseur CAMEBUY a été validé. Vous pouvez maintenant publier vos produits.'),
        'refuser':   ('refuse',   False, '❌ Votre demande a été refusée',
                      f'Bonjour {fournisseur.nom}, votre demande d\'adhésion n\'a pas pu être acceptée.'),
        'suspendre': ('suspendu', False, '⚠️ Votre compte a été suspendu',
                      f'Bonjour {fournisseur.nom}, votre compte fournisseur a été suspendu.'),
        'reactiver': ('valide',   True,  '✅ Votre compte a été réactivé',
                      f'Bonjour {fournisseur.nom}, votre compte fournisseur a été réactivé.'),
    }

    if action not in actions_map:
        return Response({'error': 'Action invalide. Options: valider, refuser, suspendre, reactiver.'}, status=400)

    new_statut, is_val, titre, msg_base = actions_map[action]
    fournisseur.statut       = new_statut
    fournisseur.is_validated = is_val
    if action in ('valider', 'reactiver'):
        fournisseur.date_validation = timezone.now()
    if note:
        fournisseur.note_admin = note
    fournisseur.save()

    message_final = msg_base + (f'\n\nMessage de l\'admin : {note}' if note else '')
    Notification.objects.create(
        destinataire=fournisseur,
        type_notif='validation',
        titre=titre,
        message=message_final,
        expediteur=request.user,
    )

    # ── Emails automatiques ───────────────────────────
    if action in ('valider', 'reactiver'):
        envoyer_email_validation(fournisseur, mot_de_passe_clair=mot_de_passe or None, note_admin=note)
    elif action == 'refuser':
        envoyer_email_refus(fournisseur, motif=note)

    return Response({'message': f'{fournisseur.nom} — statut mis à jour : {new_statut}'})


# ══════════════════════════════════════════════════════════
# ADMIN — SUPPRESSION PRODUIT AVEC MOTIF
# ══════════════════════════════════════════════════════════

MOTIFS_SUPPRESSION = {
    'prix':        'Prix non conforme aux standards de la plateforme',
    'categorie':   'Produit placé dans une mauvaise catégorie',
    'images':      'Images non conformes ou de mauvaise qualité',
    'description': 'Description trompeuse ou incomplète',
    'contrefacon': 'Suspicion de contrefaçon ou produit non autorisé',
    'doublon':     'Produit en doublon déjà existant',
    'autre':       'Non conforme aux conditions générales de CAMEBUY',
}

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_supprimer_produit(request, produit_id):
    """
    Suppression d'un produit par l'admin avec motif obligatoire.
    Body: { "motif": "prix|categorie|images|description|contrefacon|doublon|autre", "detail": "..." }
    Notifie le fournisseur par notification + email.
    """
    produit = get_object_or_404(Produit, id=produit_id)
    motif_key = request.data.get('motif', 'autre')
    detail    = request.data.get('detail', '').strip()

    motif_label = MOTIFS_SUPPRESSION.get(motif_key, MOTIFS_SUPPRESSION['autre'])
    fournisseur = produit.fournisseur
    produit_nom = produit.nom

    # Supprimer le produit
    produit.delete()

    # Notifier le fournisseur
    if fournisseur:
        msg_lines = [
            'Votre produit "' + produit_nom + '" a ete retire par l\'administration.',
            'Motif : ' + motif_label,
        ]
        if detail:
            msg_lines.append('Detail : ' + detail)
        msg_lines.append('Vous pouvez republier ce produit en corrigeant les points mentionnes.')
        Notification.objects.create(
            destinataire=fournisseur,
            type_notif='stock',
            titre='Produit retire : ' + produit_nom,
            message='\n'.join(msg_lines),
            expediteur=request.user,
        )
        # Email au fournisseur
        envoyer_email_suppression_produit(
            fournisseur,
            produit_nom=produit_nom,
            motif=motif_label,
            detail=detail,
        )

    return Response({
        'message': f'Produit "{produit_nom}" supprimé. Fournisseur notifié.',
        'motif': motif_label,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_produits(request):
    """Liste tous les produits pour l'admin avec filtres."""
    fournisseur_id = request.query_params.get('fournisseur')
    search         = request.query_params.get('search', '')

    qs = Produit.objects.select_related('categorie', 'fournisseur').all()
    if fournisseur_id:
        qs = qs.filter(fournisseur_id=fournisseur_id)
    if search:
        qs = qs.filter(nom__icontains=search)

    return Response(ProduitSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_envoyer_message(request):
    destinataires = request.data.get('destinataires', [])
    titre   = request.data.get('titre', '').strip()
    message = request.data.get('message', '').strip()

    if not titre or not message:
        return Response({'error': 'titre et message requis.'}, status=400)

    if destinataires == 'tous':
        fournisseurs = Fournisseur.objects.filter(statut='valide')
    elif isinstance(destinataires, list) and destinataires:
        fournisseurs = Fournisseur.objects.filter(id__in=destinataires)
    else:
        return Response({'error': 'destinataires invalide.'}, status=400)

    ids = []
    for f in fournisseurs:
        n = Notification.objects.create(
            destinataire=f, type_notif='message',
            titre=titre, message=message, expediteur=request.user,
        )
        ids.append(n.id)
    return Response({'message': f'Envoyé à {len(ids)} fournisseur(s).', 'ids': ids})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    return Response({
        'fournisseurs': {
            'total':      Fournisseur.objects.count(),
            'en_attente': Fournisseur.objects.filter(statut='en_attente').count(),
            'valides':    Fournisseur.objects.filter(statut='valide').count(),
            'refuses':    Fournisseur.objects.filter(statut='refuse').count(),
            'suspendus':  Fournisseur.objects.filter(statut='suspendu').count(),
        },
        'commandes': {
            'total':      Commande.objects.count(),
            'en_attente': Commande.objects.filter(statut='en_attente').count(),
            'payees':     Commande.objects.filter(statut='payee').count(),
        },
        'produits': {
            'total':        Produit.objects.count(),
            'stock_faible': Produit.objects.filter(stock__lte=5, stock__gt=0).count(),
            'rupture':      Produit.objects.filter(stock=0).count(),
        },
        'notifs_non_lues': Notification.objects.filter(lu=False).count(),
    })


# ══════════════════════════════════════════════════════════
# NOTIFICATIONS FOURNISSEUR
# ══════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_notifications(request):
    try:
        fournisseur = Fournisseur.objects.get(utilisateur=request.user)
    except Fournisseur.DoesNotExist:
        return Response({'error': 'Fournisseur introuvable.'}, status=404)
    notifs = Notification.objects.filter(destinataire=fournisseur).order_by('-cree_le')[:50]
    return Response(NotificationSerializer(notifs, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marquer_notif_lue(request, notif_id):
    try:
        f = Fournisseur.objects.get(utilisateur=request.user)
        n = Notification.objects.get(id=notif_id, destinataire=f)
    except (Fournisseur.DoesNotExist, Notification.DoesNotExist):
        return Response({'error': 'Introuvable.'}, status=404)
    n.lu = True
    n.save()
    return Response({'ok': True})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marquer_toutes_lues(request):
    try:
        f = Fournisseur.objects.get(utilisateur=request.user)
    except Fournisseur.DoesNotExist:
        return Response({'error': 'Fournisseur introuvable.'}, status=404)
    count = Notification.objects.filter(destinataire=f, lu=False).update(lu=True)
    return Response({'count': count})
