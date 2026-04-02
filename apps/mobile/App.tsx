import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export default function App() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAPIHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/health');
      
      if (!response.ok) {
        throw new Error('Failed to connect to API');
      }
      
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAPIHealth();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Fullstack Monorepo</Text>
          <Text style={styles.subtitle}>Mobile App</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backend API Status</Text>
          
          {loading && <Text style={styles.loading}>Loading...</Text>}
          
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <Text style={styles.errorHint}>
                Make sure the API is running: pnpm dev:api
              </Text>
            </View>
          )}
          
          {healthData && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Connected</Text>
              <Text style={styles.info}>Status: {healthData.status}</Text>
              <Text style={styles.info}>Uptime: {healthData.uptime.toFixed(2)}s</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={checkAPIHealth}>
            <Text style={styles.buttonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Start Guide</Text>
          <Text style={styles.info}>1. Edit this file: apps/mobile/App.tsx</Text>
          <Text style={styles.info}>2. Changes will auto-reload</Text>
          <Text style={styles.info}>3. Press Cmd+D for dev menu</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>API Endpoints</Text>
          <Text style={styles.info}>• GET /health</Text>
          <Text style={styles.info}>• GET /api-info</Text>
          <Text style={styles.info}>• Base URL: http://localhost:3000</Text>
        </View>
      </ScrollView>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 10,
  },
  errorBox: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#c33',
    marginBottom: 5,
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
  },
  successBox: {
    backgroundColor: '#efe',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a3',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
