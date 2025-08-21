import {View, Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import React from 'react';
import {BoldText, RegularText} from '../CustomTexts/BaseTexts';
import {Colors} from '../../Colors/Colors';

type Props = {
  title: string;
  description: string;
  onPress?: () => void;
  nextPage?: string;
};

const TitleText: React.FC<Props> = ({
  title,
  description,
  onPress,
  nextPage,
}) => {
  const {fontScale} = useWindowDimensions();
  return (
    <View style={styles.container}>
      <BoldText fontSize={24} color={Colors.headerColor}>
        {title}
      </BoldText>

      <View style={styles.descriptionContainer}>
        <RegularText fontSize={16} color={Colors?.grayColor}>
          {description}
        </RegularText>

        {onPress && (
          <Pressable onPress={onPress}>
            <RegularText fontSize={16} color={Colors?.primaryColor}>
              {nextPage}
            </RegularText>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default TitleText;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  descriptionContainer: {
    gap: 4,
    flexDirection: 'row',
  },
});
