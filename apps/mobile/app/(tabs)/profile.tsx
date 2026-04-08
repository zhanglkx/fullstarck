import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useThemeStore, useCounterStore } from '@/stores';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function ProfileScreen() {
  const navigation = useNavigation();

  // 使用 Zustand Store
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { colorScheme, isDark, toggleTheme } = useThemeStore();
  const { count, increment, decrement, reset } = useCounterStore();

  // 自定义导航栏
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '我的',
      headerStyle: {
        backgroundColor: isDark ? '#1C1C1E' : '#007AFF',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      // 右侧设置按钮
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSettingsPress}
          style={styles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      // 左侧通知按钮（可选）
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleNotificationPress}
          style={styles.headerButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDark, user, count]);

  // 处理设置按钮点击
  const handleSettingsPress = () => {
    // 打印日志
    console.log('=== 设置按钮点击 ===');
    console.log('当前用户:', user);
    console.log('登录状态:', isAuthenticated);
    console.log('主题模式:', isDark ? '暗黑' : '明亮');
    console.log('计数器值:', count);
    console.log('==================');

    // 弹出对话框
    Alert.alert(
      '⚙️ 设置',
      `用户: ${user?.name || '游客'}\n登录状态: ${isAuthenticated ? '已登录' : '未登录'}\n主题: ${isDark ? '暗黑模式' : '明亮模式'}\n计数器: ${count}`,
      [
        {
          text: '查看日志',
          onPress: () => {
            console.log('用户选择查看日志');
            Alert.alert('提示', '请在控制台查看完整日志');
          },
        },
        {
          text: '切换主题',
          onPress: () => {
            console.log('从导航栏切换主题');
            toggleTheme();
          },
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // 处理通知按钮点击
  const handleNotificationPress = () => {
    console.log('通知按钮点击');
    Alert.alert(
      '📬 通知',
      `你有 ${count} 条未读消息`,
      [
        {
          text: '全部已读',
          onPress: () => {
            console.log('标记全部已读');
            reset();
          },
        },
        {
          text: '关闭',
          style: 'cancel',
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: '个人信息',
      subtitle: '查看和编辑个人资料',
    },
    {
      icon: 'notifications-outline',
      title: '消息通知',
      subtitle: '管理通知设置',
    },
    {
      icon: 'settings-outline',
      title: '应用设置',
      subtitle: '偏好设置和配置',
    },
    {
      icon: 'help-circle-outline',
      title: '帮助与反馈',
      subtitle: '获取帮助或提供反馈',
    },
    {
      icon: 'information-circle-outline',
      title: '关于',
      subtitle: '版本 1.0.0',
    },
  ];

  const handleLogin = async () => {
    try {
      await login('demo@example.com', 'password');
      Alert.alert('成功', '登录成功！');
    } catch {
      Alert.alert('错误', '登录失败');
    }
  };

  const handleLogout = () => {
    Alert.alert('确认', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: logout
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 用户信息区域 */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#007AFF" />
        </View>
        <Text style={styles.userName}>{user?.name || '游客'}</Text>
        <Text style={styles.userEmail}>
          {user?.email || '未登录'}
        </Text>
        <View style={styles.statusBadge}>
          <Ionicons
            name={isAuthenticated ? 'checkmark-circle' : 'alert-circle'}
            size={16}
            color={isAuthenticated ? '#34C759' : '#FF9500'}
          />
          <Text style={[styles.statusText, { color: isAuthenticated ? '#34C759' : '#FF9500' }]}>
            {isAuthenticated ? '已登录' : '未登录'}
          </Text>
        </View>
      </View>

      {/* Zustand 状态演示 */}
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>🎯 Zustand 状态管理演示</Text>

        {/* 计数器演示 */}
        <View style={styles.demoCard}>
          <Text style={styles.demoLabel}>计数器状态:</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity style={styles.counterButton} onPress={decrement}>
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{count}</Text>
            <TouchableOpacity style={styles.counterButton} onPress={increment}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetButtonText}>重置</Text>
          </TouchableOpacity>
        </View>

        {/* 主题演示 */}
        <View style={styles.demoCard}>
          <Text style={styles.demoLabel}>主题状态:</Text>
          <View style={styles.themeInfo}>
            <Text style={styles.themeText}>当前主题: {colorScheme || 'light'}</Text>
            <Text style={styles.themeText}>暗黑模式: {isDark ? '是' : '否'}</Text>
          </View>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color="#fff" />
            <Text style={styles.themeButtonText}>切换主题</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>项目</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>48</Text>
          <Text style={styles.statLabel}>任务</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>365</Text>
          <Text style={styles.statLabel}>天数</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color="#007AFF" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        ))}
      </View>

      {/* 认证操作 */}
      {isAuthenticated ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="log-in-outline" size={20} color="#007AFF" />
          <Text style={styles.loginText}>模拟登录</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginHorizontal: 16,
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  demoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  demoCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  demoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginHorizontal: 32,
    minWidth: 60,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  themeInfo: {
    marginBottom: 12,
  },
  themeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  themeButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 8,
  },
});
