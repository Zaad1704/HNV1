#!/bin/bash

# Update German
sed -i 's/"settings": "Einstellungen"}/"settings": "Einstellungen", "search": "Suchen...", "filter": "Filter", "clear_all": "Alle Löschen", "all": "Alle", "more_options": "Weitere Optionen", "quick_links": "Schnelllinks", "legal": "Rechtliches", "about": "Über uns", "features": "Funktionen", "privacy_policy": "Datenschutzrichtlinie", "terms_of_service": "Nutzungsbedingungen", "property_management": "Immobilienverwaltung"}/' frontend/public/locales/de/translation.json

# Update Japanese  
sed -i 's/"settings": "設定"}/"settings": "設定", "search": "検索...", "filter": "フィルター", "clear_all": "すべてクリア", "all": "すべて", "more_options": "その他のオプション", "quick_links": "クイックリンク", "legal": "法的事項", "about": "について", "features": "機能", "privacy_policy": "プライバシーポリシー", "terms_of_service": "利用規約", "property_management": "不動産管理"}/' frontend/public/locales/ja/translation.json

# Update Chinese
sed -i 's/"settings": "设置"}/"settings": "设置", "search": "搜索...", "filter": "筛选", "clear_all": "清除全部", "all": "全部", "more_options": "更多选项", "quick_links": "快速链接", "legal": "法律", "about": "关于", "features": "功能", "privacy_policy": "隐私政策", "terms_of_service": "服务条款", "property_management": "房产管理"}/' frontend/public/locales/zh/translation.json

echo "Updated remaining language files"