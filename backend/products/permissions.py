from rest_framework import permissions
from .models import Fournisseur


class IsFournisseurOrReadOnly(permissions.BasePermission):
    """
    Permission qui permet aux fournisseurs de créer/modifier leurs produits,
    et à tout le monde de lire.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Pour les méthodes non-safe (POST, PUT, DELETE), vérifier si l'utilisateur est un fournisseur
        return hasattr(request.user, 'fournisseur')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Vérifier que l'utilisateur est le fournisseur du produit
        if hasattr(obj, 'fournisseur') and obj.fournisseur:
            return obj.fournisseur.utilisateur == request.user

        return False


class IsAuthenticatedOrCreateOnly(permissions.BasePermission):
    """
    Permission qui permet à tout le monde de créer (pour les commandes anonymes),
    mais nécessite une authentification pour les autres opérations.
    """

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True  # Permettre la création anonyme
        return request.user and request.user.is_authenticated


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission qui permet aux propriétaires de modifier leurs objets,
    et à tout le monde de lire.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Vérifier la propriété selon le type d'objet
        if hasattr(obj, 'utilisateur'):
            return obj.utilisateur == request.user
        elif hasattr(obj, 'client'):
            return obj.client == request.user
        elif hasattr(obj, 'fournisseur') and obj.fournisseur:
            return obj.fournisseur.utilisateur == request.user

        return False
    
    