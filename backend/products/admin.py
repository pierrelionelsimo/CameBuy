from django.contrib import admin
from .models import (
    Categorie, Produit, Fournisseur,
    Commande, CommandeItem, Paiement,
    Panier, PanierItem, Notification
)


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display  = ['id', 'nom']
    search_fields = ['nom']


@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display    = ['id', 'nom', 'telephone', 'statut', 'is_validated', 'created_at']
    list_filter     = ['statut', 'is_validated']
    search_fields   = ['nom', 'utilisateur__username']
    readonly_fields = ['created_at', 'date_validation']


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display    = ['id', 'nom', 'prix', 'stock', 'categorie', 'fournisseur', 'cree_le']
    list_filter     = ['categorie', 'fournisseur']
    search_fields   = ['nom']
    readonly_fields = ['cree_le']


class CommandeItemInline(admin.TabularInline):
    model = CommandeItem
    extra = 0


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display    = ['id', 'client', 'statut', 'total', 'cree_le']
    list_filter     = ['statut', 'cree_le']
    search_fields   = ['client__username']
    inlines         = [CommandeItemInline]
    readonly_fields = ['cree_le']


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display    = ['id', 'commande', 'montant', 'statut', 'cree_le']
    list_filter     = ['statut', 'cree_le']
    readonly_fields = ['cree_le']


@admin.register(Panier)
class PanierAdmin(admin.ModelAdmin):
    list_display = ['id', 'utilisateur']


@admin.register(PanierItem)
class PanierItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'panier', 'produit', 'quantite']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display    = ['id', 'destinataire', 'type_notif', 'titre', 'lu', 'cree_le']
    list_filter     = ['type_notif', 'lu', 'cree_le']
    search_fields   = ['titre', 'destinataire__nom']
    readonly_fields = ['cree_le']
