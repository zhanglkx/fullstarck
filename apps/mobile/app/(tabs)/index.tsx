import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export default function HomeScreen() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAPIHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3000/health');

      if (!response.ok) {
        throw new Error('Failed to connect to API');
      }

      const data = (await response.json()) as HealthResponse;
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAPIHealth();
  }, [checkAPIHealth]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Fullstack Monorepo</Text>
        <Text style={styles.subtitle}>使用 Expo Router + TabBar</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend API 状态</Text>

        {loading && <Text style={styles.loading}>Loading...</Text>}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <Text style={styles.errorHint}>确保 API 正在运行: pnpm dev:api</Text>
          </View>
        )}

        {healthData && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ 连接成功</Text>
            <Text style={styles.info}>状态: {healthData.status}</Text>
            <Text style={styles.info}>运行时长: {healthData.uptime.toFixed(2)}s</Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={() => void checkAPIHealth()}>
          <Text style={styles.buttonText}>刷新状态</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>快速开始</Text>
        <Text style={styles.info}>• 编辑文件: app/(tabs)/index.tsx</Text>
        <Text style={styles.info}>• 修改会自动重新加载</Text>
        <Text style={styles.info}>• 按 Cmd+D 打开开发菜单</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>API 端点</Text>
        <Text style={styles.info}>• GET /health</Text>
        <Text style={styles.info}>• GET /api-info</Text>
        <Text style={styles.info}>• 基础 URL: http://localhost:3000</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
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
    padding: 16,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#c33',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
  },
  successBox: {
    backgroundColor: '#efe',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a3',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
