import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { theme } from '../../theme/theme';

// Destructure for easier access
const { colors, spacing, shadows } = theme;

const RegisterScreen = ({ navigation }: any) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        state: '',
        district: '',
        city: '',
        aadhaarNumber: '',
        panNumber: '',
    });

    const [images, setImages] = useState<{
        livePhoto?: string;
        aadhaarCard?: string;
        panCard?: string;
    }>({});

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const pickImage = async (type: 'livePhoto' | 'aadhaarCard' | 'panCard') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setImages({ ...images, [type]: result.assets[0].uri });
        }
    };

    const validateStep1 = () => {
        if (!formData.firstName || !formData.lastName || !formData.mobileNumber || !formData.password) {
            Alert.alert('Missing Fields', 'Please fill all required fields');
            return false;
        }
        if (formData.mobileNumber.length !== 10) {
            Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.state || !formData.district || !formData.city) {
            Alert.alert('Missing Fields', 'Please fill all address fields');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.aadhaarNumber || !images.aadhaarCard || !images.livePhoto) {
            Alert.alert('Missing Documents', 'Please provide Aadhaar number, Aadhaar card photo, and your live photo');
            return false;
        }
        if (formData.aadhaarNumber.length !== 12) {
            Alert.alert('Invalid Aadhaar', 'Aadhaar number must be 12 digits');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        if (step === 2 && validateStep2()) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigation.goBack();
    };

    const handleRegister = async () => {
        if (!validateStep3()) return;

        setLoading(true);
        try {
            const uploadData = new FormData();

            // Append text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'confirmPassword') {
                    uploadData.append(key, (formData as any)[key]);
                }
            });

            console.log('Images state:', images);

            // Append images with proper React Native format
            if (images.livePhoto) {
                console.log('Appending livePhoto:', images.livePhoto);
                const livePhotoFile = {
                    uri: images.livePhoto,
                    type: 'image/jpeg',
                    name: 'live-photo.jpg',
                };
                uploadData.append('livePhoto', livePhotoFile as any);
            } else {
                console.log('WARNING: No livePhoto in images state!');
            }

            if (images.aadhaarCard) {
                console.log('Appending aadhaarCard:', images.aadhaarCard);
                const aadhaarFile = {
                    uri: images.aadhaarCard,
                    type: 'image/jpeg',
                    name: 'aadhaar.jpg',
                };
                uploadData.append('aadhaarCard', aadhaarFile as any);
            } else {
                console.log('WARNING: No aadhaarCard in images state!');
            }

            if (images.panCard) {
                console.log('Appending panCard:', images.panCard);
                const panFile = {
                    uri: images.panCard,
                    type: 'image/jpeg',
                    name: 'pan.jpg',
                };
                uploadData.append('panCard', panFile as any);
            }

            console.log('Submitting registration...');

            // Use fetch instead of axios for better file upload support in React Native
            const token = ''; // No token needed for registration
            const response = await fetch('http://192.168.1.8:5000/api/workers/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // Don't set Content-Type - let the browser/RN set it with boundary
                },
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            Alert.alert(
                'Registration Successful',
                'Your application has been submitted. You will be notified once approved.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error('Registration Error:', error);
            console.error('Error message:', error.message);
            const errorMessage = error.message || 'Registration failed. Please check your internet connection.';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
                <View key={s} style={styles.stepWrapper}>
                    <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                        <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
                    </View>
                    {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
                </View>
            ))}
        </View>
    );

    const renderStep1 = () => (
        <View>
            <Text style={styles.stepTitle}>Personal Details</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChangeText={(val) => updateField('firstName', val)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChangeText={(val) => updateField('lastName', val)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChangeText={(val) => updateField('mobileNumber', val)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Create a password"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(val) => updateField('password', val)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    secureTextEntry={!showPassword}
                    value={formData.confirmPassword}
                    onChangeText={(val) => updateField('confirmPassword', val)}
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={styles.stepTitle}>Address Details</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter state"
                    value={formData.state}
                    onChangeText={(val) => updateField('state', val)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>District</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter district"
                    value={formData.district}
                    onChangeText={(val) => updateField('district', val)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter city"
                    value={formData.city}
                    onChangeText={(val) => updateField('city', val)}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text style={styles.stepTitle}>Documents & Verification</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Aadhaar Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 12-digit Aadhaar number"
                    keyboardType="number-pad"
                    maxLength={12}
                    value={formData.aadhaarNumber}
                    onChangeText={(val) => updateField('aadhaarNumber', val)}
                />
            </View>

            <Text style={styles.label}>Upload Aadhaar Card *</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('aadhaarCard')}>
                {images.aadhaarCard ? (
                    <Image source={{ uri: images.aadhaarCard }} style={styles.uploadedImage} />
                ) : (
                    <>
                        <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                        <Text style={styles.uploadText}>Tap to upload Aadhaar Card</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>PAN Number (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter PAN number"
                    maxLength={10}
                    autoCapitalize="characters"
                    value={formData.panNumber}
                    onChangeText={(val) => updateField('panNumber', val)}
                />
            </View>

            <Text style={styles.label}>Upload PAN Card (Optional)</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('panCard')}>
                {images.panCard ? (
                    <Image source={{ uri: images.panCard }} style={styles.uploadedImage} />
                ) : (
                    <>
                        <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                        <Text style={styles.uploadText}>Tap to upload PAN Card</Text>
                    </>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Live Photo (Selfie) *</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('livePhoto')}>
                {images.livePhoto ? (
                    <Image source={{ uri: images.livePhoto }} style={styles.uploadedImage} />
                ) : (
                    <>
                        <Ionicons name="camera-outline" size={32} color={colors.primary} />
                        <Text style={styles.uploadText}>Tap to take/upload Selfie</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Worker Registration</Text>
                    <View style={{ width: 24 }} />
                </View>

                {renderStepIndicator()}

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <View style={styles.footer}>
                        {step < 3 ? (
                            <TouchableOpacity style={styles.button} onPress={handleNext}>
                                <Text style={styles.buttonText}>Next</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.surface} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color={colors.surface} />
                                ) : (
                                    <Text style={styles.buttonText}>Submit Registration</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.m,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.l,
        backgroundColor: colors.surface,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotActive: {
        backgroundColor: colors.primary,
    },
    stepNumber: {
        color: colors.text.secondary,
        fontWeight: 'bold',
    },
    stepNumberActive: {
        color: colors.surface,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: colors.primary,
    },
    content: {
        padding: spacing.l,
        paddingBottom: 100,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.l,
    },
    inputGroup: {
        marginBottom: spacing.m,
    },
    label: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: spacing.m,
        fontSize: 16,
        color: colors.text.primary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: spacing.m,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: spacing.m,
        fontSize: 16,
        color: colors.text.primary,
    },
    uploadBox: {
        height: 150,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginBottom: spacing.l,
        overflow: 'hidden',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadText: {
        marginTop: 8,
        color: colors.text.secondary,
        fontSize: 14,
    },
    footer: {
        marginTop: spacing.xl,
    },
    button: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 12,
        ...shadows.medium,
    },
    buttonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
