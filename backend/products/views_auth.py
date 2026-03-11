from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Fournisseur
from .serializers import FournisseurSerializer
from .email_service import envoyer_email_inscription


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class FournisseurRegistrationView(APIView):
    permission_classes = []

    def post(self, request):
        data = request.data

        username  = data.get('username', '').strip()
        email     = data.get('email', '').strip()
        password  = data.get('password', '')
        nom       = data.get('nom_fournisseur', '').strip()
        telephone = data.get('telephone', '').strip()
        adresse   = data.get('adresse', '').strip()
        photo     = request.FILES.get('photo')

        if not username or not password or not nom:
            return Response(
                {'error': 'username, password et nom_fournisseur sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not email:
            return Response(
                {'error': 'L\'adresse email est requise pour recevoir les notifications.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(username=username).exists():
            return Response({'error': "Ce nom d'utilisateur est déjà pris."}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Cette adresse email est déjà utilisée.'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)

        fournisseur = Fournisseur.objects.create(
            utilisateur=user,
            nom=nom,
            telephone=telephone,
            adresse=adresse,
            photo=photo,
            statut='en_attente',
            is_validated=False,
        )

        # ── Envoyer email de confirmation d'inscription ──
        envoyer_email_inscription(fournisseur)

        tokens = get_tokens_for_user(user)
        return Response({
            'message': (
                f'Inscription réussie ! Un email de confirmation a été envoyé à {email}. '
                'Vous serez notifié par email dès que votre compte sera validé par l\'administrateur.'
            ),
            'tokens': tokens,
            'fournisseur': FournisseurSerializer(fournisseur).data,
            'is_admin': False,
            'statut': 'en_attente',
        }, status=status.HTTP_201_CREATED)


class FournisseurLoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'username et password requis.'}, status=400)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Identifiants invalides.'}, status=401)
        if not user.is_active:
            return Response({'error': 'Ce compte a été désactivé.'}, status=403)

        tokens = get_tokens_for_user(user)

        # ── Admin ──────────────────────────────────────
        if user.is_staff or user.is_superuser:
            return Response({
                'message': f'Bienvenue, administrateur {user.username} !',
                'tokens': tokens,
                'is_admin': True,
                'admin': {
                    'id': user.id, 'username': user.username,
                    'email': user.email, 'prenom': user.first_name,
                    'nom': user.last_name or user.username,
                    'is_staff': user.is_staff, 'is_superuser': user.is_superuser,
                },
                'fournisseur': None,
            })

        # ── Fournisseur ────────────────────────────────
        try:
            fournisseur = Fournisseur.objects.get(utilisateur=user)
        except Fournisseur.DoesNotExist:
            return Response({'error': 'Aucun profil fournisseur associé à ce compte.'}, status=403)

        if fournisseur.statut == 'refuse':
            return Response({
                'error': 'Votre demande d\'adhésion a été refusée.',
                'detail': fournisseur.note_admin or 'Contactez l\'administration.',
                'statut': 'refuse',
            }, status=403)

        if fournisseur.statut == 'suspendu':
            return Response({
                'error': 'Votre compte a été suspendu.',
                'detail': fournisseur.note_admin or 'Contactez l\'administration.',
                'statut': 'suspendu',
            }, status=403)

        statut_msg = None
        if fournisseur.statut == 'en_attente':
            statut_msg = (
                'Votre compte est en attente de validation. '
                'Vous serez notifié par email dès que votre compte sera activé.'
            )

        return Response({
            'message': statut_msg or f'Bienvenue, {fournisseur.nom} !',
            'tokens': tokens,
            'is_admin': False,
            'fournisseur': FournisseurSerializer(fournisseur).data,
            'statut': fournisseur.statut,
            'admin': None,
        })
