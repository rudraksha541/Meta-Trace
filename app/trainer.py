import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Load dataset
DATASET_PATH = "tampered_metadata_dataset.csv"
df = pd.read_csv(DATASET_PATH)

# Split features and label
X = df.drop("label", axis=1)
y = df["label"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Train Random Forest Classifier
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    class_weight="balanced",
    random_state=42
)
rf_model.fit(X_train, y_train)

# Predict & evaluate
y_pred = rf_model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"✅ Accuracy: {acc:.4f}")
print("📊 Classification Report:")
print(classification_report(y_test, y_pred))


# Save model to file
MODEL_PATH = "tampering_rf_model.pkl"
joblib.dump(rf_model, MODEL_PATH)
print(f"📁 Model saved to '{MODEL_PATH}'")
