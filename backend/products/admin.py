from django.contrib import admin
from .models import Produit, Fournisseur, Categorie, Commande, Paiement, Panier, PanierItem


@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display = ['nom', 'utilisateur', 'telephone', 'adresse']
    search_fields = ['nom', 'utilisateur__username', 'telephone']


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'description']
    search_fields = ['nom']


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prix', 'stock', 'categorie', 'fournisseur', 'cree_le']
    list_filter = ['categorie', 'fournisseur', 'cree_le']
    search_fields = ['nom', 'description']
    readonly_fields = ['cree_le', 'modifie_le']


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'date_commande', 'statut', 'total']
    list_filter = ['statut', 'date_commande']
    search_fields = ['client__username', 'id']


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ['id', 'commande', 'montant', 'statut', 'date_paiement']
    list_filter = ['statut', 'date_paiement']
    search_fields = ['commande__id']


@admin.register(Panier)
class PanierAdmin(admin.ModelAdmin):
    list_display = ['utilisateur', 'date_creation', 'date_modification']
    search_fields = ['utilisateur__username']


@admin.register(PanierItem)
class PanierItemAdmin(admin.ModelAdmin):
    list_display = ['panier', 'produit', 'quantite', 'ajoute_le']
    list_filter = ['ajoute_le']
    search_fields = ['panier__utilisateur__username', 'produit__nom']
