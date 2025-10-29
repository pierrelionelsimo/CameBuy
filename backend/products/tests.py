from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Produit, Fournisseur, Categorie, Commande, Panier, PanierItem


class ProduitTests(APITestCase):
    def setUp(self):
        # Créer un utilisateur fournisseur
        self.fournisseur_user = User.objects.create_user(
            username='fournisseur', password='test123'
        )
        self.fournisseur = Fournisseur.objects.create(
            utilisateur=self.fournisseur_user,
            nom='Test Fournisseur',
            telephone='123456789'
        )

        # Créer un utilisateur client
        self.client_user = User.objects.create_user(
            username='client', password='test123'
        )

        # Créer une catégorie
        self.categorie = Categorie.objects.create(
            nom='Test Categorie',
            description='Description test'
        )

        # Créer un produit
        self.produit = Produit.objects.create(
            nom='Test Produit',
            description='Description test',
            prix=100.00,
            stock=10,
            categorie=self.categorie,
            fournisseur=self.fournisseur
        )

    def test_list_produits_unauthenticated(self):
        """Test que les produits peuvent être listés sans authentification"""
        url = reverse('produit-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_produit_fournisseur(self):
        """Test qu'un fournisseur peut créer un produit"""
        self.client.force_authenticate(user=self.fournisseur_user)
        url = reverse('produit-list')
        data = {
            'nom': 'Nouveau Produit',
            'description': 'Description',
            'prix': 50.00,
            'stock': 5,
            'categorie': self.categorie.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_produit_client_denied(self):
        """Test qu'un client ne peut pas créer de produit"""
        self.client.force_authenticate(user=self.client_user)
        url = reverse('produit-list')
        data = {
            'nom': 'Nouveau Produit',
            'description': 'Description',
            'prix': 50.00,
            'stock': 5,
            'categorie': self.categorie.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CommandeTests(APITestCase):
    def setUp(self):
        # Créer un utilisateur client
        self.client_user = User.objects.create_user(
            username='client', password='test123'
        )

        # Créer une catégorie et un produit
        self.categorie = Categorie.objects.create(nom='Test Cat')
        self.produit = Produit.objects.create(
            nom='Test Prod',
            prix=100.00,
            stock=10,
            categorie=self.categorie
        )


    def test_create_commande_authenticated(self):
        """Test qu'une commande peut être créée par un utilisateur authentifié"""
        self.client.force_authenticate(user=self.client_user)
        url = reverse('commande-list')
        data = {
            'produits': [self.produit.id],
            'statut': 'en attente'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PanierTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test123')
        self.produit = Produit.objects.create(
            nom='Test Prod',
            prix=50.00,
            stock=5
        )

    def test_panier_authenticated_access(self):
        """Test que le panier nécessite une authentification"""
        url = reverse('panier-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_panier_authenticated_user(self):
        """Test que l'utilisateur authentifié peut accéder à son panier"""
        self.client.force_authenticate(user=self.user)
        url = reverse('panier-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_item_to_panier(self):
        """Test l'ajout d'un item au panier"""
        self.client.force_authenticate(user=self.user)
        url = reverse('panieritem-list')
        data = {
            'produit_id': self.produit.id,
            'quantite': 2
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class FournisseurTests(APITestCase):
    def setUp(self):
        self.fournisseur_user = User.objects.create_user(
            username='fournisseur_test', password='test123'
        )
        self.fournisseur = Fournisseur.objects.create(
            utilisateur=self.fournisseur_user,
            nom='Test Fournisseur',
            telephone='123456789'
        )
        self.other_user = User.objects.create_user(
            username='other_test', password='test123'
        )

    def tearDown(self):
        # Nettoyer les données après chaque test
        Fournisseur.objects.all().delete()
        User.objects.all().delete()

    def test_fournisseur_access_own_profile(self):
        """Test qu'un fournisseur peut accéder à son propre profil"""
        self.client.force_authenticate(user=self.fournisseur_user)
        url = reverse('fournisseur-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_fournisseur_cannot_access_others_profile(self):
        """Test qu'un utilisateur non-fournisseur ne peut pas accéder aux profils fournisseur"""
        self.client.force_authenticate(user=self.other_user)
        url = reverse('fournisseur-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)  # Liste vide car pas de profil fournisseur
