import requests
from decouple import config
import uuid
from django.conf import settings


class MTNMomoService:
    """Service pour gérer les paiements MTN MoMo"""

    def __init__(self):
        self.api_user = config('MTN_API_USER')
        self.api_key = config('MTN_API_KEY')
        self.subscription_key = config('MTN_SUBSCRIPTION_KEY')
        self.target_env = config('MTN_TARGET_ENV')
        self.base_url = config('MTN_BASE_URL')

    def _get_access_token(self):
        """Génère un token d'accès pour l'API MTN MoMo"""
        token_url = f'https://sandbox.momodeveloper.mtn.com/disbursement/token/'
        token_headers = {
            'Ocp-Apim-Subscription-Key': self.subscription_key,
        }
        token_auth = (self.api_user, self.api_key)

        try:
            token_resp = requests.post(token_url, headers=token_headers, auth=token_auth)
            token_resp.raise_for_status()
            return token_resp.json().get('access_token')
        except requests.RequestException as e:
            raise Exception(f'Erreur lors de la génération du token: {str(e)}')

    def initiate_disbursement(self, amount, phone_number, reference='Disbursement e-commerce'):
        """Initie un paiement (envoi d'argent) MTN MoMo"""
        try:
            access_token = self._get_access_token()
            transaction_id = str(uuid.uuid4())

            transfer_url = self.base_url + 'transfer'
            transfer_headers = {
                'Authorization': f'Bearer {access_token}',
                'X-Reference-Id': transaction_id,
                'X-Target-Environment': self.target_env,
                'Ocp-Apim-Subscription-Key': self.subscription_key,
                'Content-Type': 'application/json',
            }

            transfer_data = {
                'amount': str(amount),
                'currency': 'EUR',
                'externalId': transaction_id,
                'payee': {
                    'partyIdType': 'MSISDN',
                    'partyId': phone_number
                },
                'payerMessage': reference,
                'payeeNote': reference
            }

            transfer_resp = requests.post(transfer_url, headers=transfer_headers, json=transfer_data)
            transfer_resp.raise_for_status()

            return {
                'transaction_id': transaction_id,
                'status': 'pending'
            }

        except requests.RequestException as e:
            raise Exception(f'Erreur lors de l\'initiation du paiement: {str(e)}')

    def check_disbursement_status(self, transaction_id):
        """Vérifie le statut d'un paiement MTN MoMo"""
        try:
            access_token = self._get_access_token()

            status_url = self.base_url + f'transfer/{transaction_id}'
            status_headers = {
                'Authorization': f'Bearer {access_token}',
                'X-Target-Environment': self.target_env,
                'Ocp-Apim-Subscription-Key': self.subscription_key,
            }

            status_resp = requests.get(status_url, headers=status_headers)
            status_resp.raise_for_status()

            return status_resp.json()

        except requests.RequestException as e:
            raise Exception(f'Erreur lors de la récupération du statut: {str(e)}')


class OrderService:
    """Service pour gérer la logique métier des commandes"""

    @staticmethod
    def calculate_order_total(order):
        """Calcule le total d'une commande"""
        total = 0
        for product in order.products.all():
            total += product.prix
        return total

    @staticmethod
    def validate_stock_availability(products, quantities):
        """Valide que le stock est suffisant pour les produits demandés"""
        insufficient_stock = []

        for product, quantity in zip(products, quantities):
            if product.stock < quantity:
                insufficient_stock.append({
                    'product': product.nom,
                    'available': product.stock,
                    'requested': quantity
                })

        return insufficient_stock

    @staticmethod
    def update_product_stock(order):
        """Met à jour le stock des produits après une commande"""
        for product in order.products.all():
            if product.stock > 0:
                product.stock -= 1  # Simplification : 1 unité par produit
                product.save()