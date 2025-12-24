import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    fontFamily: 'monospace',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
  },
  walletLabel: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
});
