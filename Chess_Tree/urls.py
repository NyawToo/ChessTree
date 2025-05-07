"""
URL configuration for Chess_Tree project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('chess1/', TemplateView.as_view(template_name='chess_local.html'), name='chess1'),
    path('chess2/', TemplateView.as_view(template_name='chess_global.html'), name='chess2'),
    path('sala/', TemplateView.as_view(template_name='sala.html'), name='sala'),
    path('crear/', TemplateView.as_view(template_name='crear_sala.html'), name='crear_sala'),
    path('unirme/', TemplateView.as_view(template_name='unirme_a_sala.html'), name='unirme_sala'),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
