from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Fournisseur
from .serializers import FournisseurSerializer


class FournisseurRegistrationView(APIView):
    """
    Vue pour l'inscription des fournisseurs.
    Crée un utilisateur et un profil fournisseur associé.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Récupérer les données
            username = request.data.get('username')
            password = request.data.get('password')
            email = request.data.get('email')
            nom_fournisseur = request.data.get('nom_fournisseur')
            telephone = request.data.get('telephone')
            adresse = request.data.get('adresse', '')

            # Validation des champs requis
            if not all([username, password, email, nom_fournisseur, telephone]):
                return Response(
                    {'error': 'Tous les champs sont requis sauf adresse'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier si l'utilisateur existe déjà
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Ce nom d\'utilisateur existe déjà'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Cet email existe déjà'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer l'utilisateur
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email
            )

            # Créer le profil fournisseur
            fournisseur = Fournisseur.objects.create(
                utilisateur=user,
                nom=nom_fournisseur,
                telephone=telephone,
                adresse=adresse
            )

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Sérialiser les données du fournisseur
            fournisseur_data = FournisseurSerializer(fournisseur).data

            return Response({
                'message': 'Fournisseur créé avec succès',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'fournisseur': fournisseur_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': access_token
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'inscription: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FournisseurLoginView(APIView):
    """
    Vue pour la connexion des fournisseurs.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')

            if not username or not password:
                return Response(
                    {'error': 'Nom d\'utilisateur et mot de passe requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Authentifier l'utilisateur
            user = authenticate(username=username, password=password)

            if user is None:
                return Response(
                    {'error': 'Identifiants invalides'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Vérifier que c'est un fournisseur
            if not hasattr(user, 'fournisseur'):
                return Response(
                    {'error': 'Cet utilisateur n\'est pas un fournisseur'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            fournisseur_data = FournisseurSerializer(user.fournisseur).data

            return Response({
                'message': 'Connexion réussie',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'fournisseur': fournisseur_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': access_token
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la connexion: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )