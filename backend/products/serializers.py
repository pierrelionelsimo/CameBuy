from rest_framework import serializers
from .models import Produit, Fournisseur, Categorie, Commande, Paiement,CommandeItem
from .models import Panier, PanierItem
from django.contrib.auth.models import User

class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = ['id', 'utilisateur', 'nom', 'adresse', 'telephone']

class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'description']

class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = ['id', 'nom', 'description', 'prix', 'stock', 'image', 'categorie', 'fournisseur', 'cree_le', 'modifie_le']


class CommandeItemSerializer(serializers.ModelSerializer):
    produit_id = serializers.PrimaryKeyRelatedField(
        queryset=Produit.objects.all(), source='produit'
    )

    class Meta:
        model = CommandeItem
        fields = ['produit_id', 'quantite']

class CommandeSerializer(serializers.ModelSerializer):
    items = CommandeItemSerializer(many=True)
    client = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Commande
        fields = ['id', 'client', 'date_commande', 'statut', 'total', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        commande = Commande.objects.create(**validated_data)
        
        total = 0
        for item_data in items_data:
            produit = item_data['produit']
            quantite = item_data['quantite']
            CommandeItem.objects.create(
                commande=commande, produit=produit, quantite=quantite
            )
            total += produit.prix * quantite
        
        commande.total = total
        commande.save()
        return commande



class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'commande', 'montant', 'date_paiement', 'statut']

class PanierItemSerializer(serializers.ModelSerializer):
    produit = ProduitSerializer(read_only=True)
    produit_id = serializers.PrimaryKeyRelatedField(queryset=Produit.objects.all(), source='produit', write_only=True)

    class Meta:
        model = PanierItem
        fields = ['id', 'produit', 'produit_id', 'quantite', 'ajoute_le']

class PanierSerializer(serializers.ModelSerializer):
    items = PanierItemSerializer(many=True, read_only=True)
    utilisateur = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Panier
        fields = ['id', 'utilisateur', 'date_creation', 'date_modification', 'items']
