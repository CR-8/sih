# MVP: Supervised AI model for design recommendations
# Uses scikit-learn for training a simple classifier

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib


# Load your labeled design data
# Example columns: ['project_type', 'audience', 'color_pref', 'layout_pref', 'award_winner', 'recommendation']
data = pd.read_csv('design_data.csv')

# Reduce cardinality of the recommendation column
# Define a mapping for grouping similar recommendations
recommendation_mapping = {
    'portfolio': 'portfolio',
    'blog': 'content',
    'ecommerce': 'commerce',
    'landing': 'marketing',
    'saas': 'software',
    'agency': 'services',
    'nonprofit': 'nonprofit',
    'education': 'education',
    'dashboard': 'dashboard'
}

def map_recommendation(value):
    for key in recommendation_mapping:
        if key in value.lower():
            return recommendation_mapping[key]
    return 'other'

data['recommendation'] = data['recommendation'].apply(map_recommendation)

# Transform the grouped recommendation column into discrete class labels
label_encoder = LabelEncoder()
data['recommendation'] = label_encoder.fit_transform(data['recommendation'])

X = data.drop('recommendation', axis=1)
y = data['recommendation']

# For categorical features, use one-hot encoding
X = pd.get_dummies(X)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Optimize RandomForestClassifier hyperparameters
model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print('Accuracy:', accuracy_score(y_test, y_pred))

# Save model
joblib.dump(model, 'design_recommender.pkl')
print('Model saved as design_recommender.pkl')
