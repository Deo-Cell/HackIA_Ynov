DONNÉES TÉLÉCHARGEABLES

Scripts pour générer les données:
  - DATA_01_analyse.py
  - DATA_02_clean.py
  - DATA_03_.py
  - DATA_02_medical_clean.py
  - DATA_03_medical_lora_prep.py

Comment régénérer les données:
  1. python DATA_01_clean.py (analyse)
  2. python DATA_02_clean.py (nettoyage finance)
  3. python DATA_03_clean.py (prep LoRA finance)
  4. python download_medical_dataset.py (télécharge médical)
  5. python DATA_02_medical_clean.py (nettoyage médical)
  6. python DATA_03_medical_lora_prep.py (prep LoRA médical)

Résumé:
  - Finance: 17,460 données nettoyées (1,537 backdoors supprimés)
  - Médical: 252,232 données nettoyées
  
Voir RAPPORT_QUALITE_DONNEES_COMPLET.md pour détails