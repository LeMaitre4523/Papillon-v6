import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, Modal, Pressable, Platform, StatusBar } from 'react-native';

import { useTheme, Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import GetUIColors from '../../utils/GetUIColors';

import SyncStorage, { set } from 'sync-storage';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { ContextMenuButton } from 'react-native-ios-context-menu';

import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  HueSlider,
} from 'reanimated-color-picker';

import formatCoursName from '../../utils/FormatCoursName';

import { forceSavedCourseColor } from '../../utils/ColorCoursName';
import { Dice5, Lock, MoreVertical } from 'lucide-react-native';

const CoursColor = ({ navigation }) => {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [savedColors, setSavedColors] = useState([]);

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorModalColor, setColorModalColor] = useState('#000000');
  const [currentEditedSubject, setCurrentEditedSubject] = useState('');

  const colors = [
    '#2667a9', '#76a10b', '#3498DB', '#1ABC9C', '#a01679', '#27AE60', '#156cd6', '#F39C12', '#E67E22', '#D35400', '#2C3E50', '#E74C3C', '#C0392B', '#8E44AD', '#ad4491', '#9f563b', '#920205',
    '#6a42a3', '#498821', '#2e86b3', '#17a085', '#89125f', '#2f9e49', '#1e6fcf', '#d08e15', '#b85f18', '#a33e00', '#3f515f', '#c92a1e', '#a82b1f', '#7b389f', '#a65089', '#996032', '#8c0101',
    '#6b064d', '#146c80', '#7c9f18', '#9f5610', '#b23e00', '#34495e', '#a3180f', '#891e13', '#623c85', '#b5657e', '#a6794a', '#b60000',
  ];

  const moreActions = (key) => {
    Alert.alert(
      'Plus d\'actions',
      'Que voulez-vous faire avec ' + savedColors[key].originalCourseName + ' ?',
      [
        {
          text: 'Supprimer',
          onPress: () => {
            let newCol = JSON.parse(SyncStorage.get('savedColors'));
            delete newCol[key];
            setSavedColors(newCol);
            SyncStorage.set('savedColors', JSON.stringify(newCol));
          },
          style: 'destructive',
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const onSelectColor = ({ hex }) => {
    setColorModalColor(hex);
  };

  const onSave = () => {
    let hex = colorModalColor;

    setSavedColors({
      ...savedColors,
      [currentEditedSubject]: {
        ...savedColors[currentEditedSubject],
        color: hex,
      },
    });

    forceSavedCourseColor(currentEditedSubject, hex);
    setColorModalOpen(false);
  };

  const ApplyRandomColors = () => {
    let col = {};
    let usedColors = [];

    let lockedColors = [];

    const randomColor = () => {
      let color = colors[Math.floor(Math.random() * colors.length)];
      
      if (usedColors.includes(color)) {
        return randomColor();
      } else {
        usedColors.push(color);
        return color;
      }
    };

    Object.keys(savedColors).forEach((key) => {
      if (savedColors[key].locked) {
        lockedColors.push(key);
      }
      else {
        let color = randomColor();
        forceSavedCourseColor(key, color);
      }
    });

    let newCol = JSON.parse(SyncStorage.get('savedColors'));

    // remove all entries with no color
    Object.keys(newCol).forEach((key) => {
      if (!newCol[key].color) {
        delete newCol[key];
      }
    });

    // add locked  to all entries
    Object.keys(newCol).forEach((key) => {
      newCol[key].locked = lockedColors.includes(key);
    });

    setSavedColors(newCol);
    Haptics.selectionAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    SyncStorage.init();

    let col = JSON.parse(SyncStorage.get('savedColors'));

    // remove all entries with no color and no name
    Object.keys(col).forEach((key) => {
      if (!col[key].originalCourseName) {
        delete col[key];
      }
      else if (!col[key].color) {
        delete col[key];
      }
      else if (!col[key].systemCourseName) {
        delete col[key];
      }
    });

    // add locked : false to all entries
    Object.keys(col).forEach((key) => {
      col[key].locked = false;
    });

    setSavedColors(col);
  }, []);

  // add dice button in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            ApplyRandomColors();
          }}
          style={{ padding: 10, marginRight: -7 }}
        >
          <Dice5 color={UIColors.primary} />
        </TouchableOpacity>
      ),
    });
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      { Platform.OS === 'ios' &&
        <StatusBar barStyle={'light-content'} />
      }

      <NativeList
        header="Matières enregistrées"
        inset
      >
        {savedColors && Object.keys(savedColors).map((key, index) => {
          if (savedColors[key].color && savedColors[key].originalCourseName) {
            return (
              <NativeItem
                key={index}
                leading={
                  <TouchableOpacity
                    style={[styles.colorPreview, {backgroundColor: savedColors[key].color }]}
                    onPress={() => {
                      setColorModalOpen(true);
                      setColorModalColor(savedColors[key].color);
      
                      setCurrentEditedSubject(key);
                    }}
                  />
                }

                trailing={
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 15,
                    margin: -15,
                    marginRight: -20,
                  }}>
                    <LockToggle
                      color={savedColors[key].color}
                      value={savedColors[key].locked}
                      onValueChange={(value) => {
                        setSavedColors({
                          ...savedColors,
                          [key]: {
                            ...savedColors[key],
                            locked: value,
                          },
                        });
                      }}
                    />

                    <ContextMenuButton
                      isMenuPrimaryAction={true}
                      menuConfig={{
                        menuTitle: '',
                        menuItems: [
                          {
                            actionKey: 'delete',
                            actionTitle: 'Supprimer',
                            menuAttributes: ['destructive'],
                            icon: {
                              type: 'IMAGE_SYSTEM',
                              imageValue: {
                                systemName: 'trash',
                              },
                            },
                          },
                        ],
                      }}
                      onPressMenuItem={({nativeEvent}) => {
                        if (nativeEvent.actionKey === 'delete') {
                          let newCol = JSON.parse(SyncStorage.get('savedColors'));
                          delete newCol[key];
                          setSavedColors(newCol);
                          SyncStorage.set('savedColors', JSON.stringify(newCol));
                        }
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          Platform.OS === 'android' && moreActions(key)
                        }}
                        style={{
                          padding: 15,
                          margin: -15,
                        }}
                      >
                        <MoreVertical size={20} color={UIColors.text + '75'} />
                      </TouchableOpacity>
                    </ContextMenuButton>
                  </View>
                }

                onPress={() => {
                  setColorModalOpen(true);
                  setColorModalColor(savedColors[key].color);

                  setCurrentEditedSubject(key);
                }}
              >
                <NativeText heading="b">
                  {formatCoursName(savedColors[key].originalCourseName)}
                </NativeText>
                <NativeText heading="subtitle2">
                  {savedColors[key].color.toUpperCase()}
                </NativeText>
              </NativeItem>
            );
          }
          else {
            return null;
          }
        })}
      </NativeList>

      <View style={{ height: 20 }} />

      <Modal visible={colorModalOpen} animationType='fade' transparent={true}>
        <View style={[styles.colorModalContainer]}>
          <View style={[styles.colorModal, {backgroundColor: UIColors.element}]}>
            <ColorPicker style={styles.picker} value={colorModalColor} onComplete={onSelectColor}>
              <Preview
                textStyle={{
                  fontFamily: 'Papillon-Semibold',
                }}
              />
              <Panel1 />
              <HueSlider />
              <Swatches />
            </ColorPicker>

            <View style={[styles.modalActions, {borderColor: UIColors.border}]}>
              <TouchableOpacity style={[styles.modalAction]} onPress={() => setColorModalOpen(false)}>
                <Text
                  style={[styles.modalActionText]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
              <View style={{width: 1, height: 47, backgroundColor: UIColors.border + '99'}} />
              <TouchableOpacity style={[styles.modalAction]} onPress={onSave}>
                <Text
                  style={[styles.modalActionText, {color: colorModalColor}]}
                >
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const LockToggle = ({ value, onValueChange, color }) => {
  const [locked, setLocked] = useState(value);
  const UIColors = GetUIColors();

  return (
    <TouchableOpacity
      onPress={() => {
        setLocked(!locked);
        onValueChange(!locked);
      }}

      style={[
        {
          backgroundColor: UIColors.text + '15',
          padding: 7,
          borderRadius: 100,
          margin: 5,
          marginRight: 0,
        },
        locked ? {
          backgroundColor: 
            UIColors.theme === 'dark' ?
              UIColors.text
              :
              UIColors.primary,
        } : {},
      ]}
    >
      <Lock 
        size={19}
        color={
          locked ? UIColors.modalBackground : UIColors.text
        }
        style={[
          !locked ? {opacity: 0.4} : {},
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  colorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  colorModal: {
    width: '70%',
    borderRadius: 20,
    borderCurve: 'continuous',
  },

  picker: {
    gap: 14,
    padding: 18
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 48,
    borderTopWidth: 1,
  },
  modalAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalActionText: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 16,
  },

  colorPreview: {
    width: 48,
    height: 20,
    borderRadius: 6,
    borderCurve: 'continuous',
    marginRight: 2,
  }
});

export default CoursColor;
