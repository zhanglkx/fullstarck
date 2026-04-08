import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const features = [
    {
      icon: 'navigate-outline',
      title: 'Expo Router',
      description: '基于文件系统的路由，简化导航管理',
    },
    {
      icon: 'phone-portrait-outline',
      title: 'React Native',
      description: '使用 React 构建原生移动应用',
    },
    {
      icon: 'code-slash-outline',
      title: 'TypeScript',
      description: '类型安全的开发体验',
    },
    {
      icon: 'layers-outline',
      title: 'Monorepo',
      description: '与 API 和 Web 共享代码',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="compass" size={64} color="#007AFF" />
        <Text style={styles.title}>探索技术栈</Text>
        <Text style={styles.subtitle}>现代化的全栈开发解决方案</Text>
      </View>

      <View style={styles.featureList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={feature.icon as keyof typeof Ionicons.glyphMap}
                size={32}
                color="#007AFF"
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>项目结构</Text>
        <Text style={styles.infoText}>apps/mobile - 移动端应用</Text>
        <Text style={styles.infoText}>apps/api - NestJS 后端</Text>
        <Text style={styles.infoText}>apps/web - Next.js 前端</Text>
        <Text style={styles.infoText}>packages/shared - 共享代码</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
  },
});
