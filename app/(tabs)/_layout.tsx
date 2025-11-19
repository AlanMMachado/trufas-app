import { Tabs } from 'expo-router';
import { ChartNoAxesColumnIncreasing, FileSpreadsheet, Package, User } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/Colors';

// Layout das tabs (barra inferior)
const ICON_COMPONENTS: Record<string, any> = {
  'chart': ChartNoAxesColumnIncreasing,
  'file': FileSpreadsheet,
  'package': Package,
  'User': User,
};

function TabIcon({ color, focused, icon }: { color: string; focused: boolean; icon: string }) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: focused ? 1 : 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [focused, anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const iconSize = Platform.OS === 'android' ? 24 : 28;

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
        {(() => {
          const Comp = ICON_COMPONENTS[icon];
          if (Comp) return <Comp width={iconSize} height={iconSize} color={focused ? color : COLORS.gray} />;
          return null;
        })()}
      </Animated.View>
    </View>
  );
}

function ChartIcon(props: any) {
  return <TabIcon {...props} icon={'chart'} />;
}
function FileIcon(props: any) {
  return <TabIcon {...props} icon={'file'} />;
}
function PackageIcon(props: any) {
  return <TabIcon {...props} icon={'package'} />;
}


export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.mediumBlue,
          tabBarInactiveTintColor: COLORS.gray,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 0,
            // espaçamento superior levemente maior para centralizar visualmente
            paddingTop: Platform.OS === 'ios' ? 14 : 10,
            paddingBottom: Platform.OS === 'ios' ? 16 : 18,
            minHeight: Platform.OS === 'ios' ? 84 : 92,
            elevation: 6,
            shadowColor: COLORS.navy,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
          },
          tabBarShowLabel: true,
          tabBarIconStyle: { marginTop: 5, alignItems: 'center', justifyContent: 'center' },
        }}>

        <Tabs.Screen
          name="DashboardScreen"
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarLabel: ({ focused, color }) => (
              <View style={styles.labelContainer}>
                <Text style={[styles.iconLabel, { color: focused ? color : COLORS.gray }]} allowFontScaling={false}>
                  Dashboard
                </Text>
                <View style={[styles.labelIndicator, { width: focused ? 26 : 0, backgroundColor: focused ? color : 'transparent' }]} />
              </View>
            ),
            tabBarIcon: ({ color, focused }) => <ChartIcon color={color} focused={focused} />,
          }}
        />

        <Tabs.Screen
          name="RelatoriosScreen"
          options={{
            title: 'Relatórios',
            headerShown: false,
            tabBarLabel: ({ focused, color }) => (
              <View style={styles.labelContainer}>
                <Text style={[styles.iconLabel, { color: focused ? color : COLORS.gray }]} allowFontScaling={false}>
                  Relatórios
                </Text>
                <View style={[styles.labelIndicator, { width: focused ? 26 : 0, backgroundColor: focused ? color : 'transparent' }]} />
              </View>
            ),
            tabBarIcon: ({ color, focused }) => <FileIcon color={color} focused={focused} />,
          }}
        />

        <Tabs.Screen
          name="RemessasScreen"
          options={{
            title: 'Remessas',
            headerShown: false,
            tabBarLabel: ({ focused, color }) => (
              <View style={styles.labelContainer}>
                <Text style={[styles.iconLabel, { color: focused ? color : COLORS.gray }]} allowFontScaling={false}>
                  Remessas
                </Text>
                <View style={[styles.labelIndicator, { width: focused ? 26 : 0, backgroundColor: focused ? color : 'transparent' }]} />
              </View>
            ),
            tabBarIcon: ({ color, focused }) => <PackageIcon color={color} focused={focused} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tabIcon: {
    fontSize: 25,
  },
  indicator: {
    position: 'absolute',
    bottom: -25,
    width: 5,
    height: 5,
    borderRadius: 2,
  },
  iconShape: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.gray,
    backgroundColor: 'transparent',
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  labelIndicator: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
    alignSelf: 'center',
    minWidth: 6,
  },
  whatsappButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 108,
    zIndex: 1000,
    backgroundColor: '#25D366',
    borderRadius: 30,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  whatsappIcon: {
    width: 40,
    height: 40,
  },
});
