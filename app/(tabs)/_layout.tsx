import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="resumes" options={{ title: "Mis CVs" }} />
      <Tabs.Screen name="templates" options={{ title: "Plantillas" }} />
      <Tabs.Screen name="assistant" options={{ title: "Entrevista" }} />
    </Tabs>
  );
}