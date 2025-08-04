#!/usr/bin/env python3
import csv
import random
import os

# Lista de íconos válidos de Material Icons organizados por categorías
material_icons = {
    # Personas y roles
    'people': ['person', 'supervisor_account', 'manage_accounts', 'group', 'face', 'account_circle'],
    
    # Negocios y empresas
    'business': ['business', 'work', 'account_balance', 'store', 'domain', 'apartment'],
    
    # Tecnología
    'technology': ['computer', 'code', 'developer_mode', 'memory', 'storage', 'router'],
    
    # Comunicación
    'communication': ['email', 'phone', 'message', 'chat', 'forum', 'campaign'],
    
    # Finanzas
    'finance': ['account_balance_wallet', 'payment', 'credit_card', 'trending_up', 'trending_down', 'analytics'],
    
    # Marketing y ventas
    'marketing': ['campaign', 'point_of_sale', 'shopping_cart', 'storefront', 'local_offer', 'loyalty'],
    
    # Operaciones
    'operations': ['settings', 'build', 'engineering', 'construction', 'factory', 'warehouse'],
    
    # Recursos humanos
    'hr': ['people_alt', 'diversity_3', 'psychology', 'school', 'work_outline', 'assignment_ind'],
    
    # Legal
    'legal': ['gavel', 'policy', 'security', 'verified_user', 'admin_panel_settings', 'rule'],
    
    # Producto
    'product': ['inventory', 'category', 'design_services', 'palette', 'brush', 'color_lens'],
    
    # Investigación y desarrollo
    'research': ['science', 'biotech', 'chemistry', 'psychology', 'school', 'auto_stories'],
    
    # Entretenimiento
    'entertainment': ['movie', 'music_note', 'sports_esports', 'theaters', 'live_tv', 'radio'],
    
    # Logística
    'logistics': ['local_shipping', 'flight', 'train', 'directions_car', 'local_warehouse', 'inventory_2'],
    
    # Servicios
    'services': ['support_agent', 'headset_mic', 'help', 'info', 'contact_support', 'customer_service'],
    
    # Ubicación
    'location': ['location_on', 'place', 'map', 'navigation', 'explore', 'travel_explore'],
    
    # Dashboard y análisis
    'dashboard': ['dashboard', 'analytics', 'insights', 'assessment', 'bar_chart', 'pie_chart'],
    
    # Archivos y documentos
    'files': ['description', 'article', 'folder', 'cloud', 'backup', 'archive'],
    
    # Redes sociales
    'social': ['share', 'public', 'language', 'connect_without_contact', 'group_work', 'team'],
    
    # Seguridad
    'security': ['security', 'lock', 'vpn_key', 'shield', 'verified', 'admin_panel_settings'],
    
    # Innovación
    'innovation': ['lightbulb', 'auto_awesome', 'star', 'favorite', 'trending_up', 'rocket_launch'],
    
    # Sostenibilidad
    'sustainability': ['eco', 'recycling', 'nature', 'park', 'grass', 'forest'],
    
    # Salud
    'health': ['health_and_safety', 'medical_services', 'favorite', 'healing', 'spa', 'fitness_center']
}

# Mapeo de departamentos a categorías de íconos
department_map = {
    'Executive': ['business', 'work', 'account_balance'],
    'Finance': ['account_balance_wallet', 'payment', 'trending_up', 'analytics'],
    'Legal': ['gavel', 'policy', 'security', 'verified_user'],
    'Technology': ['computer', 'code', 'developer_mode', 'memory'],
    'Engineering': ['engineering', 'build', 'construction', 'settings'],
    'Marketing': ['campaign', 'point_of_sale', 'storefront', 'local_offer'],
    'Sales': ['point_of_sale', 'shopping_cart', 'storefront', 'loyalty'],
    'Operations': ['settings', 'build', 'factory', 'warehouse'],
    'HR': ['people_alt', 'diversity_3', 'psychology', 'school'],
    'Product': ['inventory', 'category', 'design_services', 'palette'],
    'Research': ['science', 'biotech', 'chemistry', 'psychology'],
    'Entertainment': ['movie', 'music_note', 'theaters', 'live_tv'],
    'Logistics': ['local_shipping', 'flight', 'local_warehouse', 'inventory_2'],
    'Services': ['support_agent', 'headset_mic', 'help', 'customer_service'],
    'Regional': ['location_on', 'place', 'map', 'navigation'],
    'Communications': ['email', 'phone', 'message', 'chat'],
    'Supply Chain': ['local_shipping', 'local_warehouse', 'inventory_2', 'factory'],
    'Manufacturing': ['factory', 'build', 'engineering', 'construction'],
    'Cloud': ['cloud', 'storage', 'router', 'memory'],
    'Content': ['article', 'description', 'folder', 'archive'],
    'Social Media': ['share', 'public', 'language', 'group_work'],
    'Security': ['security', 'lock', 'shield', 'verified'],
    'Innovation': ['lightbulb', 'auto_awesome', 'star', 'rocket_launch'],
    'Sustainability': ['eco', 'recycling', 'nature', 'park'],
    'Health': ['health_and_safety', 'medical_services', 'favorite', 'healing'],
    'Wealth Management': ['account_balance_wallet', 'trending_up', 'analytics', 'assessment'],
    'Investment Banking': ['account_balance', 'trending_up', 'analytics', 'assessment'],
    'Banking': ['account_balance', 'payment', 'credit_card', 'account_balance_wallet'],
    'Retail': ['store', 'shopping_cart', 'storefront', 'point_of_sale'],
    'Film': ['movie', 'theaters', 'live_tv', 'video_library'],
    'Board': ['business', 'account_balance', 'admin_panel_settings', 'verified_user'],
    'Compliance': ['verified_user', 'admin_panel_settings', 'security', 'policy'],
    'Strategy': ['trending_up', 'analytics', 'assessment', 'insights'],
    'International': ['language', 'public', 'flight', 'travel_explore'],
    'Merchandising': ['inventory', 'category', 'local_offer', 'loyalty'],
    'Human Resources': ['people_alt', 'diversity_3', 'psychology', 'school'],
    'Risk Management': ['security', 'warning', 'error', 'priority_high'],
    'Infrastructure': ['router', 'storage', 'memory', 'settings'],
    'Datacenter': ['storage', 'memory', 'router', 'settings'],
    'Platform': ['developer_mode', 'code', 'settings', 'build'],
    'AI': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Machine Learning': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Deep Learning': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Computing': ['computer', 'memory', 'storage', 'developer_mode'],
    'Gaming': ['sports_esports', 'gamepad', 'videogame_asset', 'casino'],
    'Virtual Reality': ['view_in_ar', '3d_rotation', 'view_in_ar', 'vrpano'],
    'Artificial Intelligence': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Messaging': ['message', 'chat', 'forum', 'support_agent'],
    'Fintech': ['account_balance_wallet', 'payment', 'credit_card', 'trending_up'],
    'User Experience': ['palette', 'brush', 'color_lens', 'design_services'],
    'Creative Cloud': ['palette', 'brush', 'color_lens', 'design_services'],
    'Document Cloud': ['description', 'article', 'folder', 'cloud'],
    'Experience Cloud': ['dashboard', 'analytics', 'insights', 'assessment'],
    'Search': ['search', 'find_in_page', 'manage_search', 'youtube_searched_for'],
    'Android': ['android', 'phone_android', 'developer_mode', 'code'],
    'Google AI': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Google Cloud': ['cloud', 'storage', 'router', 'memory'],
    'Google Workspace': ['work', 'business', 'account_balance', 'domain'],
    'AWS': ['cloud', 'storage', 'router', 'memory'],
    'Fulfillment': ['local_shipping', 'local_warehouse', 'inventory_2', 'factory'],
    'Diversity': ['diversity_3', 'people_alt', 'psychology', 'school'],
    'Talent': ['people_alt', 'psychology', 'school', 'assignment_ind'],
    'Culture': ['people_alt', 'diversity_3', 'psychology', 'school'],
    'Development': ['developer_mode', 'code', 'school', 'auto_stories'],
    'CPU': ['memory', 'storage', 'developer_mode', 'settings'],
    'GPU': ['memory', 'storage', 'developer_mode', 'settings'],
    'Mobile': ['phone_android', 'smartphone', 'tablet_android', 'devices'],
    'Quality': ['verified', 'verified_user', 'check_circle', 'star'],
    'Aerodynamics': ['flight', 'airplanemode_active', 'rocket_launch', 'auto_awesome'],
    'Hardware': ['memory', 'storage', 'developer_mode', 'settings'],
    'Software': ['code', 'developer_mode', 'computer', 'settings'],
    'Supercharger': ['ev_station', 'battery_charging_full', 'power', 'electric_car'],
    'Charging Network': ['ev_station', 'battery_charging_full', 'power', 'electric_car'],
    'Vehicles': ['directions_car', 'electric_car', 'local_shipping', 'flight'],
    'Autopilot': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Vehicle Engineering': ['engineering', 'build', 'construction', 'settings'],
    'Design': ['palette', 'brush', 'color_lens', 'design_services'],
    'Mechanical Engineering': ['engineering', 'build', 'construction', 'settings'],
    'Production': ['factory', 'build', 'engineering', 'construction'],
    'Gigafactory': ['factory', 'build', 'engineering', 'construction'],
    'Global Production': ['factory', 'build', 'engineering', 'construction'],
    'Global Operations': ['settings', 'build', 'factory', 'warehouse'],
    'Global Sales': ['point_of_sale', 'shopping_cart', 'storefront', 'loyalty'],
    'Global Marketing': ['campaign', 'point_of_sale', 'storefront', 'local_offer'],
    'Global Business': ['business', 'work', 'account_balance', 'domain'],
    'Global Affairs': ['public', 'language', 'policy', 'admin_panel_settings'],
    'Public Policy': ['policy', 'admin_panel_settings', 'gavel', 'verified_user'],
    'Government Affairs': ['policy', 'admin_panel_settings', 'gavel', 'verified_user'],
    'Facebook': ['facebook', 'share', 'public', 'language'],
    'Instagram': ['camera_alt', 'photo_camera', 'image', 'filter'],
    'WhatsApp': ['message', 'chat', 'forum', 'support_agent'],
    'Messenger': ['message', 'chat', 'forum', 'support_agent'],
    'Novi': ['account_balance_wallet', 'payment', 'credit_card', 'trending_up'],
    'Oculus': ['view_in_ar', '3d_rotation', 'view_in_ar', 'vrpano'],
    'Netflix': ['movie', 'theaters', 'live_tv', 'video_library'],
    'Original Content': ['article', 'description', 'folder', 'archive'],
    'Drama Series': ['movie', 'theaters', 'live_tv', 'video_library'],
    'Original Films': ['movie', 'theaters', 'live_tv', 'video_library'],
    'Acquisitions': ['shopping_cart', 'storefront', 'point_of_sale', 'loyalty'],
    'Public Relations': ['campaign', 'message', 'chat', 'forum'],
    'General Counsel': ['gavel', 'policy', 'security', 'verified_user'],
    'Legal Affairs': ['gavel', 'policy', 'security', 'verified_user'],
    'Photoshop': ['palette', 'brush', 'color_lens', 'design_services'],
    'Illustrator': ['palette', 'brush', 'color_lens', 'design_services'],
    'Digital Experience': ['dashboard', 'analytics', 'insights', 'assessment'],
    'Analytics': ['analytics', 'bar_chart', 'pie_chart', 'trending_up'],
    'Einstein': ['psychology', 'science', 'biotech', 'auto_awesome'],
    'Sales Cloud': ['point_of_sale', 'shopping_cart', 'storefront', 'loyalty'],
    'Service Cloud': ['support_agent', 'headset_mic', 'help', 'customer_service'],
    'Marketing Cloud': ['campaign', 'point_of_sale', 'storefront', 'local_offer'],
    'Commerce Cloud': ['shopping_cart', 'storefront', 'point_of_sale', 'loyalty'],
    'Heroku': ['cloud', 'storage', 'router', 'memory'],
    'Digital Marketing': ['campaign', 'point_of_sale', 'storefront', 'local_offer'],
    'Events': ['event', 'today', 'date_range', 'schedule'],
    'Corporate Finance': ['account_balance_wallet', 'payment', 'trending_up', 'analytics'],
    'Investor Relations': ['account_balance_wallet', 'trending_up', 'analytics', 'assessment'],
    'Financial Operations': ['account_balance_wallet', 'payment', 'trending_up', 'analytics'],
    'Accounting': ['account_balance_wallet', 'payment', 'trending_up', 'analytics'],
    'Asia Pacific': ['location_on', 'place', 'map', 'navigation'],
    'Latin America': ['location_on', 'place', 'map', 'navigation'],
    'Network Infrastructure': ['router', 'storage', 'memory', 'settings'],
    'Cybersecurity': ['security', 'lock', 'shield', 'verified'],
    'People Officer': ['people_alt', 'diversity_3', 'psychology', 'school'],
    'International Strategy': ['trending_up', 'analytics', 'assessment', 'insights'],
    'Emerging Markets': ['trending_up', 'analytics', 'assessment', 'insights'],
    'International Operations': ['settings', 'build', 'factory', 'warehouse'],
    'Expansion': ['trending_up', 'analytics', 'assessment', 'insights'],
    'Store Operations': ['store', 'shopping_cart', 'storefront', 'point_of_sale'],
    'Store Management': ['store', 'shopping_cart', 'storefront', 'point_of_sale'],
    "Sam's Club": ['store', 'shopping_cart', 'storefront', 'point_of_sale'],
    'Memberships': ['card_membership', 'loyalty', 'local_offer', 'star'],
    'Categories': ['inventory', 'category', 'local_offer', 'loyalty'],
    'Tools': ['build', 'engineering', 'construction', 'settings'],
    'Recruitment': ['people_alt', 'psychology', 'school', 'assignment_ind'],
    'Corporate Architecture': ['architecture', 'build', 'engineering', 'construction'],
    'Systems': ['memory', 'storage', 'developer_mode', 'settings'],
    'Cloud Infrastructure': ['cloud', 'storage', 'router', 'memory'],
    'Cloud Engineering': ['cloud', 'storage', 'router', 'memory'],
    'Applications': ['apps', 'developer_mode', 'code', 'settings'],
    'Cloud Products': ['cloud', 'storage', 'router', 'memory'],
    'Executive Vice President': ['business', 'work', 'account_balance', 'domain'],
    'Social Responsibility': ['eco', 'recycling', 'nature', 'park'],
    'Product Development': ['inventory', 'category', 'design_services', 'palette'],
    'North America': ['location_on', 'place', 'map', 'navigation'],
    'United States': ['location_on', 'place', 'map', 'navigation'],
    'Canada': ['location_on', 'place', 'map', 'navigation'],
    'Europe': ['location_on', 'place', 'map', 'navigation'],
    'Africa': ['location_on', 'place', 'map', 'navigation'],
    'Middle East': ['location_on', 'place', 'map', 'navigation'],
    'South Asia': ['location_on', 'place', 'map', 'navigation'],
    'Digital Development': ['developer_mode', 'code', 'computer', 'settings'],
    'Motion Picture Production': ['movie', 'theaters', 'live_tv', 'video_library'],
    'Content Development': ['article', 'description', 'folder', 'archive'],
    'Distribution': ['local_shipping', 'flight', 'local_warehouse', 'inventory_2'],
    'Content Distribution': ['local_shipping', 'flight', 'local_warehouse', 'inventory_2'],
    'Programming': ['code', 'developer_mode', 'computer', 'settings'],
    'Streaming': ['live_tv', 'video_library', 'movie', 'theaters'],
    'Digital Platforms': ['dashboard', 'analytics', 'insights', 'assessment'],
    'Asset Management': ['account_balance_wallet', 'trending_up', 'analytics', 'assessment'],
    'Credit Cards': ['credit_card', 'payment', 'account_balance_wallet', 'trending_up'],
    'Digital Products': ['dashboard', 'analytics', 'insights', 'assessment'],
    'Risk': ['security', 'warning', 'error', 'priority_high'],
    'Products & Solutions': ['inventory', 'category', 'design_services', 'palette'],
    'Regional Operations': ['settings', 'build', 'factory', 'warehouse'],
    'Local Operations': ['settings', 'build', 'factory', 'warehouse'],
    'Datacenters': ['storage', 'memory', 'router', 'settings'],
    'Canada Expansion': ['trending_up', 'analytics', 'assessment', 'insights'],
    'Beauty': ['palette', 'brush', 'color_lens', 'design_services'],
    'Skin Care': ['palette', 'brush', 'color_lens', 'design_services'],
    'Home Care': ['home', 'cleaning_services', 'local_laundry_service', 'kitchen'],
    'Cleaning': ['cleaning_services', 'local_laundry_service', 'kitchen', 'home'],
    'Personal Care': ['person', 'face', 'account_circle', 'palette'],
    'Hair Care': ['content_cut', 'palette', 'brush', 'color_lens']
}

def get_random_icon():
    """Obtener un ícono aleatorio de cualquier categoría"""
    categories = list(material_icons.keys())
    random_category = random.choice(categories)
    icons_in_category = material_icons[random_category]
    return random.choice(icons_in_category)

def get_icon_for_department(department):
    """Obtener un ícono apropiado para el departamento"""
    if department in department_map:
        icons = department_map[department]
        return random.choice(icons)
    else:
        return get_random_icon()

def update_csv_with_random_icons():
    """Actualizar el archivo CSV con íconos aleatorios"""
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'companies-board.csv')
    
    try:
        # Leer el archivo CSV
        with open(csv_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        updated_lines = []
        processed_count = 0
        
        for i, line in enumerate(lines):
            if i == 0:
                # Mantener el header
                updated_lines.append(line)
                continue
            
            if not line.strip():
                # Mantener líneas vacías
                updated_lines.append(line)
                continue
            
            # Parsear la línea CSV
            columns = line.split(',')
            if len(columns) >= 8:
                department = columns[7].strip()
                
                # Generar ícono basado en el departamento
                icon = get_icon_for_department(department)
                
                # Actualizar la columna Img (índice 4)
                columns[4] = icon
                
                updated_lines.append(','.join(columns))
                processed_count += 1
            else:
                updated_lines.append(line)
        
        # Escribir el archivo actualizado
        with open(csv_path, 'w', encoding='utf-8') as file:
            file.writelines(updated_lines)
        
        print('✅ Archivo CSV actualizado exitosamente con íconos aleatorios de Material Icons')
        print(f'📊 Total de líneas procesadas: {processed_count}')
        
        # Mostrar algunos ejemplos de mapeo
        print('\n🎯 Ejemplos de mapeo de departamentos a íconos:')
        sample_departments = ['Executive', 'Technology', 'Finance', 'Marketing', 'HR', 'Legal']
        for dept in sample_departments:
            icon = get_icon_for_department(dept)
            print(f'   {dept} → {icon}')
        
    except Exception as error:
        print(f'❌ Error al actualizar el archivo CSV: {error}')

if __name__ == '__main__':
    update_csv_with_random_icons() 