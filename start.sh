#!/bin/bash

# Démarrer le backend avec le port fourni par Render
uvicorn main:app --host 0.0.0.0 --port $PORT