from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from products.views import (
    ProduitViewSet, FournisseurViewSet, CategorieViewSet,
    CommandeViewSet, PaiementViewSet, PanierViewSet, PanierItemViewSet,
    MTNMomoDisbursementInitView, MTNMomoDisbursementStatusView,
    passer_commande, update_commande_statut,
    admin_list_fournisseurs, admin_valider_fournisseur,
    admin_envoyer_message, admin_stats,
    mes_notifications, marquer_notif_lue, marquer_toutes_lues,
    admin_supprimer_produit, admin_list_produits,
)
from products.views_auth import FournisseurRegistrationView, FournisseurLoginView

router = routers.DefaultRouter()
router.register(r'produits',     ProduitViewSet)
router.register(r'fournisseurs', FournisseurViewSet)
router.register(r'categories',   CategorieViewSet)
router.register(r'commandes',    CommandeViewSet, basename= 'commandes')
router.register(r'paiements',    PaiementViewSet, basename='paiements')
router.register(r'panier',       PanierViewSet,     basename='panier')
router.register(r'panier-items', PanierItemViewSet, basename='panieritem')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/passer-commande/',                    passer_commande,       name='passer_commande'),
    path('api/commandes/<int:commande_id>/statut/', update_commande_statut,name='update_commande_statut'),
    path('api/momo/init/',   MTNMomoDisbursementInitView.as_view(),  name='momo_init'),
    path('api/momo/status/', MTNMomoDisbursementStatusView.as_view(),name='momo_status'),
    path('api/auth/fournisseur/register/', FournisseurRegistrationView.as_view(), name='fournisseur-register'),
    path('api/auth/fournisseur/login/',    FournisseurLoginView.as_view(),         name='fournisseur-login'),
    path('api/token/',              TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(),    name='token-refresh'),
    # Admin
    path('api/admin/stats/',                                    admin_stats,               name='admin_stats'),
    path('api/admin/fournisseurs/',                             admin_list_fournisseurs,   name='admin_list_fournisseurs'),
    path('api/admin/fournisseurs/<int:fournisseur_id>/action/', admin_valider_fournisseur, name='admin_valider_fournisseur'),
    path('api/admin/messages/',                                 admin_envoyer_message,     name='admin_envoyer_message'),
    path('api/admin/produits/',                                    admin_list_produits,        name='admin_list_produits'),
    path('api/admin/produits/<int:produit_id>/supprimer/',         admin_supprimer_produit,    name='admin_supprimer_produit'),
    # Notifications
    path('api/notifications/',                   mes_notifications,   name='mes_notifications'),
    path('api/notifications/lire-tout/',         marquer_toutes_lues, name='marquer_toutes_lues'),
    path('api/notifications/<int:notif_id>/lu/', marquer_notif_lue,   name='marquer_notif_lue'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# Ces lignes seront ajoutées dans urlpatterns — voir instructions ci-dessous
