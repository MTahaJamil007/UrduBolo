import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Volume2, HelpCircle, Eye, Info, Trash2, Award } from "lucide-react-native";
import { colors } from "../constants/colors";
import { useProgressStore } from "../stores/useProgressStore";
import { useUserStore } from "../stores/useUserStore";

export default function SettingsScreen() {
  const router = useRouter();
  
  // Zustand Store variables
  const progressState = useProgressStore();
  const userState = useUserStore();
  
  // Local state for interactive settings edits
  const [name, setName] = useState(userState.name || "");
  const [gender, setGender] = useState<"m" | "f" | "prefer-not-to-say" | null>(
    userState.genderPreference || null
  );
  
  // Secrets count for long press reset
  const [secretCount, setSecretCount] = useState(0);

  const handleSaveProfile = () => {
    userState.setProfile(name.trim() || null, gender);
    progressState.setUserName(name.trim() || "");
    progressState.setGenderPreference(gender);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleTitlePress = () => {
    const nextCount = secretCount + 1;
    if (nextCount >= 5) {
      setSecretCount(0);
      progressState.reset();
      userState.setProfile(null, null);
      setName("");
      setGender(null);
      Alert.alert(
        "⚡ Developer Bypass",
        "Progress reset successfully! You are now back to Level 1.1 with 0 XP."
      );
    } else {
      setSecretCount(nextCount);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset Progress",
      "Are you absolutely sure you want to delete all your streaks, XP, and completed chapters? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: () => {
            progressState.reset();
            userState.setProfile(null, null);
            setName("");
            setGender(null);
            Alert.alert("Reset Complete", "All progress has been wiped.");
          },
        },
      ]
    );
  };

  const toggleHints = () => {
    progressState.updatePreferences({
      hintsEnabled: !progressState.preferences.hintsEnabled,
    });
  };

  const toggleAutoplay = () => {
    progressState.updatePreferences({
      autoplayEnabled: !progressState.preferences.autoplayEnabled,
    });
  };

  const toggleMotion = () => {
    progressState.updatePreferences({
      reduceMotion: !progressState.preferences.reduceMotion,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        
        {/* Title responds to long presses */}
        <TouchableOpacity activeOpacity={1} onPress={handleTitlePress}>
          <Text style={styles.headerTitle}>Settings</Text>
        </TouchableOpacity>
        
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Section 1: User Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#2dd4bf" />
            <Text style={styles.sectionTitle}>Profile Details</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Gender Preference</Text>
            <Text style={styles.fieldHint}>
              Urdu verbs change based on who is being addressed (e.g. Aap kaise hain vs Aap kaisi hain). Selecting your preference helps personalize exercise audios!
            </Text>
            
            <View style={styles.genderOptions}>
              <TouchableOpacity
                onPress={() => setGender("m")}
                style={[
                  styles.genderBtn,
                  gender === "m" && styles.genderBtnActive,
                ]}
              >
                <Text style={[styles.genderText, gender === "m" && styles.genderTextActive]}>
                  Brother (Male)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setGender("f")}
                style={[
                  styles.genderBtn,
                  gender === "f" && styles.genderBtnActive,
                ]}
              >
                <Text style={[styles.genderText, gender === "f" && styles.genderTextActive]}>
                  Sister (Female)
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => setGender("prefer-not-to-say")}
              style={[
                styles.genderBtnFull,
                gender === "prefer-not-to-say" && styles.genderBtnActive,
                { marginTop: 8 }
              ]}
            >
              <Text style={[styles.genderText, gender === "prefer-not-to-say" && styles.genderTextActive]}>
                Neutral / Prefer Not to Say
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveProfile}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>Save Profile Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Volume2 size={18} color="#2dd4bf" />
            <Text style={styles.sectionTitle}>Learning Settings</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleLabel}>Show Pronunciation Hints</Text>
                <Text style={styles.toggleDesc}>
                  Provides spelling help and tips below exercises. Toggling off helps master memory.
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#1f2937", true: colors.primaryLight }}
                thumbColor="#ffffff"
                onValueChange={toggleHints}
                value={progressState.preferences.hintsEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleLabel}>Audio Autoplay</Text>
                <Text style={styles.toggleDesc}>
                  Automatically plays Urdu pronunciation audio when loading a practice question.
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#1f2937", true: colors.primaryLight }}
                thumbColor="#ffffff"
                onValueChange={toggleAutoplay}
                value={progressState.preferences.autoplayEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleLabel}>Reduce Motion</Text>
                <Text style={styles.toggleDesc}>
                  Simplifies transition effects and pulsating glows for lower-power devices.
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#1f2937", true: colors.primaryLight }}
                thumbColor="#ffffff"
                onValueChange={toggleMotion}
                value={progressState.preferences.reduceMotion}
              />
            </View>
          </View>
        </View>

        {/* Section 3: Cultural Information & Branding */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={18} color="#2dd4bf" />
            <Text style={styles.sectionTitle}>About Bolo Urdu</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Bolo Urdu is specifically tailored for heritage learners who want to master spoken Pakistani Urdu. By keeping our content centered around Pakistani contexts, vocabulary, and customs, we bring you closer to home with every single lesson.
            </Text>
            
            <View style={styles.statsCard}>
              <Award size={20} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statsText}>
                Total Score Balance: <Text style={{ color: "#ffffff", fontWeight: "900" }}>{progressState.totalXP} XP</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Area */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={confirmReset}
            style={styles.dangerBtn}
          >
            <Trash2 size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.dangerBtnText}>Reset Learning Progress</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d5c56",
    borderRadius: 22,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionTitle: {
    color: "#2dd4bf",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#0d5c56",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  fieldLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  fieldHint: {
    color: "#a7f3d0",
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.8,
    marginBottom: 12,
  },
  textInput: {
    height: 48,
    backgroundColor: "#092e2b",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#092e2b",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  genderBtnFull: {
    height: 44,
    backgroundColor: "#092e2b",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  genderBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: "#ffffff",
  },
  genderText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "700",
  },
  genderTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  saveBtn: {
    backgroundColor: colors.primaryLight,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  toggleLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  toggleDesc: {
    color: "#a7f3d0",
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 12,
  },
  aboutText: {
    color: "#a7f3d0",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#092e2b",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  statsText: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 10,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
    height: 52,
    borderRadius: 26,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  dangerBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
