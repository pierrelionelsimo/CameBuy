
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated

from .models import Produit, Fournisseur, Categorie, Commande, Paiement, Panier, PanierItem
from .serializers import (
    ProduitSerializer, FournisseurSerializer, CategorieSerializer,
    CommandeSerializer, PaiementSerializer, PanierSerializer, PanierItemSerializer
)
from .services import MTNMomoService, OrderService
from .permissions import IsFournisseurOrReadOnly, IsAuthenticatedOrCreateOnly, IsOwnerOrReadOnly


class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [IsFournisseurOrReadOnly]

    def perform_create(self, serializer):
        # Associer automatiquement le produit au fournisseur connecté
        if hasattr(self.request.user, 'fournisseur'):
            serializer.save(fournisseur=self.request.user.fournisseur)
        else:
            serializer.save()


class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Les fournisseurs ne voient que leur propre profil
        if self.request.user.is_authenticated and Fournisseur.objects.filter(utilisateur=self.request.user).exists():
            return Fournisseur.objects.filter(utilisateur=self.request.user)
        return Fournisseur.objects.none()


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CommandeViewSet(viewsets.ModelViewSet):
    queryset = Commande.objects.all()  # ← obligatoire
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Commande.objects.filter(client=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)




class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Les utilisateurs voient seulement leurs propres paiements
        if self.request.user.is_authenticated:
            return Paiement.objects.filter(commande__client=self.request.user)
        return Paiement.objects.none()


class PanierViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        panier, created = Panier.objects.get_or_create(utilisateur=request.user)
        serializer = PanierSerializer(panier)
        return Response(serializer.data)


class PanierItemViewSet(viewsets.ModelViewSet):
    serializer_class = PanierItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        panier, _ = Panier.objects.get_or_create(utilisateur=self.request.user)
        return PanierItem.objects.filter(panier=panier)

    def perform_create(self, serializer):
        panier, _ = Panier.objects.get_or_create(utilisateur=self.request.user)
        serializer.save(panier=panier)

# --- API Paiement MTN MoMo (sandbox) ---
class MTNMomoDisbursementInitView(APIView):
    """
    Vue pour initier un paiement (envoi d'argent) MTN MoMo Disbursements en sandbox.
    Reçoit : montant, numéro mobile, référence, etc.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            montant = request.data.get('montant')
            numero = request.data.get('numero')
            reference = request.data.get('reference', 'Disbursement e-commerce')

            if not montant or not numero:
                return Response(
                    {'error': 'montant et numero sont requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            momo_service = MTNMomoService()
            result = momo_service.initiate_disbursement(montant, numero, reference)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MTNMomoDisbursementStatusView(APIView):
    """
    Endpoint pour vérifier le statut d'un paiement MTN MoMo Disbursements (sandbox).
    Reçoit : transaction_id (UUID)
    Retourne : statut de la transaction
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            transaction_id = request.query_params.get('transaction_id')

            if not transaction_id:
                return Response(
                    {'error': 'transaction_id requis en paramètre GET'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            momo_service = MTNMomoService()
            result = momo_service.check_disbursement_status(transaction_id)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def passer_commande(request):
    """
    Crée une commande à partir du panier de l'utilisateur connecté
    et initie directement un paiement MoMo.
    """
    user = request.user
    try:
        panier = Panier.objects.get(utilisateur=user)
        items = panier.items.all()
    except Panier.DoesNotExist:
        return Response({'error': 'Panier introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if not items.exists():
        return Response({'error': 'Votre panier est vide.'}, status=status.HTTP_400_BAD_REQUEST)

    total = 0
    commande = Commande.objects.create(client=user, statut='en_attente', total=0)

    for item in items:
        produit = item.produit
        if produit.stock < item.quantite:
            commande.delete()
            return Response({'error': f'Stock insuffisant pour {produit.nom}'}, status=status.HTTP_400_BAD_REQUEST)

        produit.stock -= item.quantite
        produit.save()

        # Crée la relation entre commande et produit
        commande.produits.add(produit)
        total += float(produit.prix) * item.quantite

    commande.total = total
    commande.save()

    # Crée le paiement en attente
    paiement = Paiement.objects.create(
        commande=commande,
        montant=total,
        statut='en_attente'
    )

    # Vide le panier
    panier.items.all().delete()

    # --- Initier le paiement MoMo immédiatement ---
    try:
        momo_service = MTNMomoService()
        numero_client = request.data.get('numero')  # numéro mobile fourni par le client
        if not numero_client:
            return Response({'error': 'Numéro de paiement requis.'}, status=status.HTTP_400_BAD_REQUEST)

        momo_result = momo_service.initiate_disbursement(
            montant=total,
            numero=numero_client,
            reference=f"Commande#{commande.id}"
        )
    except Exception as e:
        return Response({'error': f'Erreur initiation paiement : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = CommandeSerializer(commande)
    return Response({
        'message': 'Commande créée et paiement initié avec succès',
        'commande': serializer.data,
        'paiement_id': paiement.id,
        'momo_transaction': momo_result
    }, status=status.HTTP_201_CREATED)
