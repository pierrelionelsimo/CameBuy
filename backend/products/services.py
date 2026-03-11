import requests
import uuid
from decouple import config


class MTNMomoService:
    """Service pour gérer les paiements MTN MoMo (sandbox Disbursement)"""

    def __init__(self):
        self.api_user = config('MTN_API_USER')
        self.api_key = config('MTN_API_KEY')
        self.subscription_key = config('MTN_SUBSCRIPTION_KEY')
        self.target_env = config('MTN_TARGET_ENV', default='sandbox')
        # ✅ URL de base correcte pour Disbursement sandbox
        self.base_url = config(
            'MTN_BASE_URL',
            default='https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/'
        )

    # ─────────────────────────────────────────────────────────
    # 🔹 1. Récupération du token d'accès
    # ─────────────────────────────────────────────────────────
    def _get_access_token(self):
        """Génère un token d'accès Bearer pour l'API MTN MoMo"""
        token_url = "https://sandbox.momodeveloper.mtn.com/disbursement/token/"
        headers = {
            "Ocp-Apim-Subscription-Key": self.subscription_key,
        }
        try:
            response = requests.post(
                token_url,
                headers=headers,
                auth=(self.api_user, self.api_key),
                timeout=15
            )
            response.raise_for_status()
            token = response.json().get("access_token")
            if not token:
                raise Exception("Token absent dans la réponse MTN MoMo.")
            return token
        except requests.RequestException as e:
            raise Exception(f"Erreur lors de la génération du token : {e}")

    # ─────────────────────────────────────────────────────────
    # 🔹 2. Normalisation du numéro de téléphone
    # ─────────────────────────────────────────────────────────
    @staticmethod
    def _normalize_phone(phone_number: str) -> str:
        """Normalise le numéro au format MSISDN (ex: 237XXXXXXXXX)"""
        phone_number = phone_number.strip().replace(" ", "").replace("+", "")
        if phone_number.startswith("237"):
            return phone_number
        if phone_number.startswith("6") or phone_number.startswith("2"):
            return f"237{phone_number}"
        raise ValueError(
            "Numéro de téléphone invalide. "
            "Doit commencer par 6, 2, 237 ou +237."
        )

    # ─────────────────────────────────────────────────────────
    # 🔹 3. Initiation d'un paiement (Disbursement)
    # ─────────────────────────────────────────────────────────
    def initiate_disbursement(self, montant, numero, reference="Commande CAMEBUY"):
        """
        Initie un paiement (envoi d'argent) MTN MoMo Disbursement.

        Args:
            montant  : Montant à envoyer (int ou float)
            numero   : Numéro mobile du bénéficiaire
            reference: Libellé de la transaction

        Returns:
            dict: { message, transaction_id, status }
        """
        access_token = self._get_access_token()
        transaction_id = str(uuid.uuid4())
        phone_number = self._normalize_phone(str(numero))

        url = f"{self.base_url}transfer"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Reference-Id": transaction_id,
            "X-Target-Environment": self.target_env,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json",
        }

        payload = {
            "amount": str(int(montant)),   # MTN attend un entier en string
            # ✅ FIX CRITIQUE : la sandbox MTN exige EUR, pas XAF
            "currency": "EUR",
            "externalId": transaction_id,
            "payee": {
                "partyIdType": "MSISDN",
                "partyId": phone_number
            },
            "payerMessage": reference,
            "payeeNote": "Paiement commande CAMEBUY"
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=20)

            # ✅ 202 Accepted = succès pour MoMo Disbursement
            if response.status_code == 202:
                return {
                    "message": "Paiement initié avec succès",
                    "transaction_id": transaction_id,
                    "status": "pending"
                }

            # Toute autre réponse = erreur
            raise Exception(
                f"Erreur API MoMo ({response.status_code}): {response.text}"
            )

        except requests.RequestException as e:
            raise Exception(f"Erreur réseau lors de l'initiation du paiement : {str(e)}")

    # ─────────────────────────────────────────────────────────
    # 🔹 4. Vérification du statut d'un transfert
    # ─────────────────────────────────────────────────────────
    def check_disbursement_status(self, transaction_id: str) -> dict:
        """
        Vérifie le statut d'un paiement MTN MoMo.

        Returns:
            dict avec les champs : status, amount, currency, etc.
        """
        access_token = self._get_access_token()
        url = f"{self.base_url}transfer/{transaction_id}"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Target-Environment": self.target_env,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
        }

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"Erreur lors de la récupération du statut : {str(e)}")


# ─────────────────────────────────────────────────────────────
# 🔹 5. Service de gestion des commandes
# ─────────────────────────────────────────────────────────────
class OrderService:
    """Service pour gérer la logique métier des commandes"""

    @staticmethod
    def calculate_order_total(order):
        """Calcule le total d'une commande depuis ses items"""
        return sum(
            item.produit.prix * item.quantite
            for item in order.items.all()
        )

    @staticmethod
    def validate_stock_availability(items):
        """
        Valide que le stock est suffisant.

        Args:
            items: queryset de CommandeItem ou liste de dicts
                   avec 'produit' et 'quantite'

        Returns:
            Liste des produits en rupture de stock
        """
        insufficient = []
        for item in items:
            produit = item.produit if hasattr(item, 'produit') else item['produit']
            quantite = item.quantite if hasattr(item, 'quantite') else item['quantite']
            if produit.stock < quantite:
                insufficient.append({
                    'product': produit.nom,
                    'available': produit.stock,
                    'requested': quantite
                })
        return insufficient

    @staticmethod
    def update_product_stock(commande):
        """Met à jour le stock des produits après validation d'une commande"""
        for item in commande.items.all():
            produit = item.produit
            if produit.stock >= item.quantite:
                produit.stock -= item.quantite
                produit.save()
