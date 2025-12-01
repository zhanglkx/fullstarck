import React from 'react'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '../../gluestack-ui.config'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import {
  Box,
  Text,
  Heading,
  Button,
  ButtonText,
} from '@gluestack-ui/themed'

export const App = () => {
  return (
    <GluestackUIProvider config={config}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Box style={styles.content}>
            <Heading style={styles.mainHeading}>Hello there,</Heading>
            <Text style={styles.subHeading}>Welcome Mobile 👋</Text>

            <Box style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.emoji}>✅</Text>
                <View style={styles.textContainer}>
                  <Heading style={styles.cardTitle}>You're up and running</Heading>
                  <Text style={styles.subtitle}>Gluestack UI is working!</Text>
                </View>
              </View>
            </Box>

            <Box style={styles.card}>
              <Heading style={styles.cardHeading}>Learning materials</Heading>
              <View style={styles.linkList}>
                <Button>
                  <ButtonText>📚 Documentation</ButtonText>
                </Button>
                <Text style={styles.linkDescription}>Everything is in there</Text>

                <Button>
                  <ButtonText>📝 Blog</ButtonText>
                </Button>
                <Text style={styles.linkDescription}>
                  Changelog, features & events
                </Text>

                <Button>
                  <ButtonText>🎥 YouTube channel</ButtonText>
                </Button>
                <Text style={styles.linkDescription}>
                  Nx Show, talks & tutorials
                </Text>
              </View>
            </Box>

            <Box style={styles.card}>
              <Heading style={styles.cardHeading}>Next steps</Heading>
              <Text style={styles.subtitle}>
                Here are some things you can do with Nx:
              </Text>

              <Box style={styles.codeBlock}>
                <Text style={styles.codeText}># Build</Text>
                <Text style={styles.codeText}>nx build mobile</Text>
                <Text style={styles.codeText}># Test</Text>
                <Text style={styles.codeText}>nx test mobile</Text>
              </Box>
            </Box>

            <Box style={styles.footer}>
              <Text style={styles.footerText}>Carefully crafted with ❤️</Text>
            </Box>
          </Box>
        </ScrollView>
      </SafeAreaView>
    </GluestackUIProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 20,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  linkList: {
    gap: 8,
  },
  linkDescription: {
    fontSize: 12,
    color: '#999',
    marginLeft: 16,
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
  },
  codeText: {
    color: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
})

export default App
