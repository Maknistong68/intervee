import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME, FONT_SIZES } from '../../constants/theme';

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK_THEME.surface,
          borderTopColor: DARK_THEME.divider,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: DARK_THEME.primary,
        tabBarInactiveTintColor: DARK_THEME.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Interview',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎤" label="Interview" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviewer"
        options={{
          title: 'Reviewer',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📝" label="Reviewer" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="History" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" label="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabIconFocused: {
    // Icon doesn't change, but could add effects
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    color: DARK_THEME.textMuted,
  },
  tabLabelFocused: {
    color: DARK_THEME.primary,
    fontWeight: '600',
  },
});
