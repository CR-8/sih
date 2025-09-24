# Flask API to serve design recommendation model
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import logging
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
model = joblib.load('design_recommender.pkl')

# Load the label encoder (we need to save it during training)
# For now, let's create a mapping based on the training data
recommendation_classes = [
    'portfolio', 'content', 'commerce', 'marketing', 'software', 'services', 'nonprofit', 'education', 'dashboard', 'other'
]

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Example: expected input keys
FEATURES = ['mood', 'color_pref', 'style', 'audience', 'premium', 'description']

def map_questionnaire_to_model_input(questionnaire_data):
    """
    Map questionnaire responses to the format expected by the trained model
    """
    # Initialize all expected dummy columns to 0
    model_input = {
        # Project type dummies (we'll infer from mood/style)
        'project_type_portfolio': 0,
        'project_type_blog': 0, 
        'project_type_ecommerce': 0,
        'project_type_landing': 0,
        'project_type_other': 0,
        
        # Audience dummies
        'audience_tech': 0,
        'audience_creative': 0,
        'audience_enterprise': 0,
        'audience_young': 0,
        'audience_general': 0,
        
        # Color preference dummies
        'color_pref_blue': 0,
        'color_pref_purple': 0,
        'color_pref_green': 0,
        'color_pref_orange': 0,
        'color_pref_red': 0,
        'color_pref_neutral': 0,
        
        # Layout preference dummies (we'll infer from style)
        'layout_pref_minimal': 0,
        'layout_pref_grid': 0,
        'layout_pref_classic': 0,
        'layout_pref_modern': 0,
        'layout_pref_card-based': 0,
        
        # Award winner dummies (we'll infer from premium)
        'award_winner_yes': 0,
        'award_winner_no': 0
    }
    
    # Map mood/style to project type
    mood = questionnaire_data.get('mood', '').lower()
    style = questionnaire_data.get('style', '').lower()
    
    if 'portfolio' in mood or 'modern' in mood:
        model_input['project_type_portfolio'] = 1
    elif 'blog' in mood or 'content' in style:
        model_input['project_type_blog'] = 1
    elif 'commerce' in mood or 'ecommerce' in style:
        model_input['project_type_ecommerce'] = 1
    elif 'marketing' in mood or 'landing' in style:
        model_input['project_type_landing'] = 1
    else:
        model_input['project_type_other'] = 1
    
    # Map audience
    audience = questionnaire_data.get('audience', '').lower()
    if 'tech' in audience:
        model_input['audience_tech'] = 1
    elif 'creative' in audience or 'artist' in audience:
        model_input['audience_creative'] = 1
    elif 'business' in audience or 'enterprise' in audience:
        model_input['audience_enterprise'] = 1
    elif 'young' in audience:
        model_input['audience_young'] = 1
    else:
        model_input['audience_general'] = 1
    
    # Map color preference
    color_pref = questionnaire_data.get('color_pref', '').lower()
    if 'blue' in color_pref:
        model_input['color_pref_blue'] = 1
    elif 'purple' in color_pref:
        model_input['color_pref_purple'] = 1
    elif 'green' in color_pref:
        model_input['color_pref_green'] = 1
    elif 'orange' in color_pref:
        model_input['color_pref_orange'] = 1
    elif 'red' in color_pref:
        model_input['color_pref_red'] = 1
    else:
        model_input['color_pref_neutral'] = 1
    
    # Map style to layout preference
    if 'minimal' in style or 'clean' in style:
        model_input['layout_pref_minimal'] = 1
    elif 'grid' in style:
        model_input['layout_pref_grid'] = 1
    elif 'classic' in style or 'traditional' in style:
        model_input['layout_pref_classic'] = 1
    elif 'modern' in style or 'contemporary' in style:
        model_input['layout_pref_modern'] = 1
    elif 'card' in style:
        model_input['layout_pref_card-based'] = 1
    else:
        model_input['layout_pref_modern'] = 1  # Default
    
    # Map premium to award winner
    premium = questionnaire_data.get('premium', '').lower()
    if 'yes' in premium:
        model_input['award_winner_yes'] = 1
    else:
        model_input['award_winner_no'] = 1
    
    return model_input

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    logging.debug(f'Received input data: {data}')
    
    # Process selections into flat dict
    input_data = {}
    if 'selections' in data:
        for item in data['selections']:
            input_data[item['question']] = item['answer']
    if 'description' in data:
        input_data['description'] = data['description']
    
    # If no data provided, return default recommendation
    if not input_data:
        return jsonify({
            'recommendation': 'Consider modern design principles, user-centered approach, and clear communication of your unique value proposition.',
            'category': 'other'
        })
    
    # Check if this is questionnaire data (has mood, style, etc.) or direct model data
    is_questionnaire_data = any(key in input_data for key in ['mood', 'style', 'premium'])
    
    if is_questionnaire_data:
        # Map questionnaire responses to model format
        model_input = map_questionnaire_to_model_input(input_data)
    else:
        # Handle direct model data (legacy format)
        model_input = {}
        
        # Map direct inputs to expected format
        project_type = input_data.get('project_type', 'other')
        audience = input_data.get('audience', 'general') 
        color_pref = input_data.get('color_pref', 'neutral')
        layout_pref = input_data.get('layout_pref', 'modern')
        award_winner = input_data.get('award_winner', 'no')
        
        # Create dummy variables
        model_input = {
            f'project_type_{project_type}': 1,
            f'audience_{audience}': 1,
            f'color_pref_{color_pref}': 1,
            f'layout_pref_{layout_pref}': 1,
            f'award_winner_{award_winner}': 1
        }
    
    # Convert to DataFrame
    df = pd.DataFrame([model_input])
    
    # Ensure all expected columns exist
    expected_columns = []
    if hasattr(model, 'feature_names_in_'):
        expected_columns = model.feature_names_in_
    else:
        # Fallback: try to infer from common training columns
        expected_columns = ['project_type_portfolio', 'project_type_blog', 'project_type_ecommerce', 
                          'project_type_landing', 'project_type_other', 'audience_tech', 'audience_creative', 
                          'audience_enterprise', 'audience_young', 'audience_general', 'color_pref_blue', 
                          'color_pref_purple', 'color_pref_green', 'color_pref_orange', 'color_pref_red', 
                          'color_pref_neutral', 'layout_pref_minimal', 'layout_pref_grid', 'layout_pref_classic', 
                          'layout_pref_modern', 'layout_pref_card-based', 'award_winner_yes', 'award_winner_no']
    
    # Add missing columns with default value 0
    for col in expected_columns:
        if col not in df.columns:
            df[col] = 0
    
    # Ensure columns are in the same order as training
    df = df[expected_columns]
    
    try:
        pred = model.predict(df)[0]
        logging.debug(f'Model prediction: {pred}')
        
        # Convert numpy int to regular Python int
        pred_int = int(pred)
        
        # Map the prediction to a category name
        category = recommendation_classes[pred_int] if pred_int < len(recommendation_classes) else 'other'
        
        # Return a sample recommendation based on category
        recommendations = {
            'portfolio': 'Use a clean sans-serif font, modern color palette, generous whitespace, and a grid layout for showcasing projects effectively.',
            'content': 'Implement readable typography, comfortable line lengths, clear navigation, and engaging visual elements for content-focused sites.',
            'commerce': 'Focus on prominent product imagery, clear calls-to-action, trust indicators, and streamlined checkout process.',
            'marketing': 'Create compelling hero sections, strong visual hierarchy, persuasive copy, and clear conversion paths.',
            'software': 'Prioritize clean interfaces, intuitive navigation, strong information architecture, and user-friendly design patterns.',
            'services': 'Showcase expertise through case studies, testimonials, service highlights, and professional presentation.',
            'nonprofit': 'Use trustworthy design, emotional storytelling, clear donation paths, and community-focused messaging.',
            'education': 'Implement clear information hierarchy, engaging visuals, accessible design, and trust-building elements.',
            'dashboard': 'Focus on data visualization, clear metrics display, intuitive controls, and efficient information layout.',
            'other': 'Consider modern design principles, user-centered approach, and clear communication of your unique value proposition.'
        }
        
        recommendation_text = recommendations.get(category, recommendations['other'])
        
        return jsonify({'recommendation': recommendation_text, 'category': category})
    
    except Exception as e:
        logging.error(f'Prediction error: {e}')
        # Return fallback recommendation
        return jsonify({
            'recommendation': 'Consider modern design principles, user-centered approach, and clear communication of your unique value proposition.',
            'category': 'other'
        })

if __name__ == '__main__':
    app.run(port=5000)
