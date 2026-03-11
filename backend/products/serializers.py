from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Produit, Fournisseur, Categorie,
    Commande, CommandeItem, Paiement,
    Panier, PanierItem, Notification
)


# ──────────────────────────────────────────────────────────
# FOURNISSEUR MINI  ← imbriqué dans ProduitSerializer
# ──────────────────────────────────────────────────────────
class FournisseurMiniSerializer(serializers.ModelSerializer):
    """Sérialiseur compact pour l'affichage dans ProductCard."""
    class Meta:
        model  = Fournisseur
        fields = ['id', 'nom', 'telephone', 'adresse', 'photo', 'statut', 'is_validated']


# ──────────────────────────────────────────────────────────
# FOURNISSEUR COMPLET
# ──────────────────────────────────────────────────────────
class FournisseurSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='utilisateur.username', read_only=True)
    email    = serializers.CharField(source='utilisateur.email',    read_only=True)
    produits_count = serializers.SerializerMethodField()

    class Meta:
        model  = Fournisseur
        fields = [
            'id', 'nom', 'telephone', 'adresse', 'photo', 'description',
            'statut', 'is_validated', 'date_validation', 'note_admin',
            'username', 'email', 'produits_count', 'created_at',
        ]
        read_only_fields = ['statut', 'is_validated', 'date_validation']

    def get_produits_count(self, obj):
        return obj.produits.count()


# ──────────────────────────────────────────────────────────
# CATÉGORIE
# ──────────────────────────────────────────────────────────
class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categorie
        fields = ['id', 'nom', 'image']


# ──────────────────────────────────────────────────────────
# PRODUIT  ← fournisseur imbriqué en lecture
# ──────────────────────────────────────────────────────────
class ProduitSerializer(serializers.ModelSerializer):
    # Lecture : objet imbriqué complet → ProductCard reçoit fournisseur.nom, .telephone, etc.
    fournisseur = FournisseurMiniSerializer(read_only=True)

    # Écriture : on accepte fournisseur_id
    fournisseur_id = serializers.PrimaryKeyRelatedField(
        queryset=Fournisseur.objects.all(),
        source='fournisseur',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model  = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'stock',
            'image', 'categorie', 'fournisseur', 'fournisseur_id', 'cree_le',
        ]


# ──────────────────────────────────────────────────────────
# COMMANDE ITEM
# ──────────────────────────────────────────────────────────
class CommandeItemSerializer(serializers.ModelSerializer):
    produit_nom  = serializers.CharField(source='produit.nom',  read_only=True)
    produit_prix = serializers.DecimalField(
        source='produit.prix', max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model  = CommandeItem
        fields = ['id', 'produit', 'produit_nom', 'produit_prix', 'quantite']


# ──────────────────────────────────────────────────────────
# COMMANDE
# ──────────────────────────────────────────────────────────
class CommandeSerializer(serializers.ModelSerializer):
    items        = CommandeItemSerializer(many=True, read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True)

    class Meta:
        model  = Commande
        fields = ['id', 'client', 'client_username', 'statut', 'total', 'items', 'cree_le']
        read_only_fields = ['client']


# ──────────────────────────────────────────────────────────
# PAIEMENT
# ──────────────────────────────────────────────────────────
class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Paiement
        fields = ['id', 'commande', 'montant', 'statut', 'cree_le']


# ──────────────────────────────────────────────────────────
# PANIER
# ──────────────────────────────────────────────────────────
class PanierItemSerializer(serializers.ModelSerializer):
    produit_detail = ProduitSerializer(source='produit', read_only=True)

    class Meta:
        model  = PanierItem
        fields = ['id', 'produit', 'produit_detail', 'quantite']


class PanierSerializer(serializers.ModelSerializer):
    items = PanierItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Panier
        fields = ['id', 'utilisateur', 'items']


# ──────────────────────────────────────────────────────────
# NOTIFICATION  ← NOUVEAU
# ──────────────────────────────────────────────────────────
class NotificationSerializer(serializers.ModelSerializer):
    expediteur_nom = serializers.SerializerMethodField()

    class Meta:
        model  = Notification
        fields = [
            'id', 'type_notif', 'titre', 'message',
            'lu', 'cree_le', 'expediteur_nom',
        ]

    def get_expediteur_nom(self, obj):
        if obj.expediteur:
            return obj.expediteur.get_full_name() or obj.expediteur.username
        return "Système CAMEBUY"
