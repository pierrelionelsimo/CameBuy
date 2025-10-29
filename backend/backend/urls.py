"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from products.views import (
    ProduitViewSet,
    FournisseurViewSet,
    CategorieViewSet,
    CommandeViewSet,
    PaiementViewSet,
    PanierViewSet, PanierItemViewSet,
    MTNMomoDisbursementInitView,
    MTNMomoDisbursementStatusView,
    passer_commande,
)
from products.views_auth import FournisseurRegistrationView, FournisseurLoginView

router = routers.DefaultRouter()
router.register(r'produits', ProduitViewSet)
router.register(r'fournisseurs', FournisseurViewSet)
router.register(r'categories', CategorieViewSet)
router.register(r'commandes', CommandeViewSet)
router.register(r'paiements', PaiementViewSet)
router.register(r'panier', PanierViewSet, basename='panier')
router.register(r'panier-items', PanierItemViewSet, basename='panieritem')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('passer-commande/', passer_commande, name='passer_commande'),
    path('momo/init/', MTNMomoDisbursementInitView.as_view(), name='momo_init'),
    path('momo/status/', MTNMomoDisbursementStatusView.as_view(), name='momo_status'),
    # Authentification fournisseurs
    path('api/auth/fournisseur/register/', FournisseurRegistrationView.as_view(), name='fournisseur-register'),
    path('api/auth/fournisseur/login/', FournisseurLoginView.as_view(), name='fournisseur-login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]

# Servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
