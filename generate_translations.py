import json

# Base English translations
with open('frontend/public/locales/en/translation.json', 'r') as f:
    en_data = json.load(f)

# Generate French
fr_data = json.loads(json.dumps(en_data))
fr_data['header'] = {'login': 'Connexion', 'get_started': 'Commencer'}
fr_data['nav'] = {'home': 'Accueil', 'about': 'À propos', 'pricing': 'Tarifs', 'contact': 'Contact', 'login': 'Connexion'}
fr_data['services'] = {'title': 'Nos Services', 'subtitle': 'Solutions complètes de gestion immobilière', 'property_tracking_title': 'Suivi des Propriétés', 'property_tracking_desc': 'Suivez toutes vos propriétés en un seul endroit', 'rent_collection_title': 'Collecte de Loyer', 'rent_collection_desc': 'Collecte automatique de loyer et rappels', 'tenant_management_title': 'Gestion des Locataires', 'tenant_management_desc': 'Gérez les locataires et les contrats de bail'}
fr_data['install_app'] = {'title': 'Installer Notre App', 'subtitle': 'Obtenez l\'expérience mobile native'}

with open('frontend/public/locales/fr/translation.json', 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, ensure_ascii=False, indent=2)

# Generate German
de_data = json.loads(json.dumps(en_data))
de_data['header'] = {'login': 'Anmelden', 'get_started': 'Loslegen'}
de_data['nav'] = {'home': 'Startseite', 'about': 'Über uns', 'pricing': 'Preise', 'contact': 'Kontakt', 'login': 'Anmelden'}
de_data['services'] = {'title': 'Unsere Dienste', 'subtitle': 'Umfassende Immobilienverwaltungslösungen', 'property_tracking_title': 'Immobilien-Tracking', 'property_tracking_desc': 'Verfolgen Sie alle Ihre Immobilien an einem Ort', 'rent_collection_title': 'Mieteinzug', 'rent_collection_desc': 'Automatischer Mieteinzug und Erinnerungen', 'tenant_management_title': 'Mieterverwaltung', 'tenant_management_desc': 'Verwalten Sie Mieter und Mietverträge'}
de_data['install_app'] = {'title': 'Unsere App Installieren', 'subtitle': 'Native mobile Erfahrung erhalten'}

with open('frontend/public/locales/de/translation.json', 'w', encoding='utf-8') as f:
    json.dump(de_data, f, ensure_ascii=False, indent=2)

print("Generated French and German translations")