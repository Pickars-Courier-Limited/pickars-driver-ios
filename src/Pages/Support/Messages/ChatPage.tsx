import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useSocket} from '../../../Context/useSocket';
import {v4 as uuidv4} from 'uuid';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../Redux/Store';
import {fetchDriverCustomerMessages} from '../../../Redux/Messages/Messages';
import {useRoute} from '@react-navigation/native';
import MessageHeaders from '../../../Components/Headers/MessageHeaders';
import {Colors} from '../../../Components/Colors/Colors';
import {RegularText} from '../../../Components/Texts/CustomTexts/BaseTexts';
import IconsContainer from '../../../Components/Icons/IconContainer';
import SendIcon from '../../../Components/Icons/SendIcon/SendIcon';
import PendingIcon from '../../../Components/Icons/PendingIcon/PendingIcon';
import CheckedIcon from '../../../Components/Icons/CheckedIcon/Checkedcon';
import LockIcon from '../../../Components/Icons/LockIcon/LockIcon';
import 'react-native-get-random-values';

interface Message {
  uuid: string;
  user: string;
  message: string;
  timestamp: string;
  status?: 'pending' | 'delivered';
}

const ChatPage: React.FC = () => {
  const inputRef = useRef<TextInput>(null);
  const {socket} = useSocket();
  const [message, setMessage] = useState<string>('');
  const [messageList, setMessageList] = useState<Message[]>([]);

  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [messagesFetched, setMessagesFetched] = useState<Message[]>([]);

  const route = useRoute();
  const {
    plateNumber,
    driverName,
    support = false,
    imageUrl,
    driver,
    phoneNumber,
    _id,
  } = route.params || {};
  const groupId = _id;
  //const groupId = '1111';
  useEffect(() => {
    dispatch(fetchDriverCustomerMessages(groupId))
      .then(response => {
        console.log(response, 'response.payload', response.payload?.length);

        if (response.payload === 'No messages found for this groupId.') {
          setMessagesFetched([]);
        } else if (response.payload?.status === 200) {
          setMessagesFetched(response.payload?.messages);
        } else {
          setMessagesFetched([]);
        }
      })
      .catch(error => console.error('Error fetching messages:', error));
  }, [dispatch, groupId]);

  useEffect(() => {
    if (socket) {
      socket.emit('join_group_ride_message', groupId);
      setHasJoined(true);
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data: Message) => {
        setMessageList(prevMessages => {
          const updatedMessages = prevMessages.filter(
            msg => !(msg.uuid === data.uuid && msg.status === 'pending'),
          );
          return [...updatedMessages, data];
        });
      };

      socket.on('receive_message_ride_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message_ride_message', handleReceiveMessage);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [messageList, messagesFetched]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      const newMessage = {
        groupId,
        message: message.trim(),
        sender: 'driver',
        uuid: uuidv4(),
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending',
      };

      socket.emit('send_message_ride_message', newMessage);
      setMessageList(prevMessages => [...prevMessages, newMessage]);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const formatDate = (date: any) => {
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) return '....';

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    return validDate.toLocaleString('en-GB', options);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{flex: 1}}>
        <MessageHeaders
          badgeColor={Colors.primaryColorChat}
          fullName={driverName}
          callBackgroundIconColor={Colors.primaryColorChatFaded}
          callIconColor={Colors.primaryColorChat}
          driver={support === true ? false : true}
          support={false}
          plateNumber={plateNumber}
          phoneNumber={phoneNumber}
          support={support}
        />

        {hasJoined && (
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.chatBox}
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}>
              <View style={styles.lockMessageContainer}>
                <LockIcon fill={Colors.primaryColorChat} width={18} />
                <RegularText style={styles.lockMessageText}>
                  All messages are securely encrypted. Messages are cleared at
                  the end of the ride
                </RegularText>
              </View>

              {[
                ...(Array.isArray(messagesFetched) ? messagesFetched : []),
                ...(Array.isArray(messageList) ? messageList : []),
              ].map(item => (
                <View key={item?.uuid}>
                  <View
                    style={[
                      styles.messageContainer,
                      item?.sender === 'driver'
                        ? styles.myMessage
                        : styles.otherMessage,
                      {
                        backgroundColor:
                          item?.sender === 'driver'
                            ? Colors.whiteColor
                            : Colors.primaryColorChat,
                      },
                    ]}>
                    <RegularText
                      style={[
                        styles.messageText,
                        {
                          color:
                            item?.sender === 'driver'
                              ? Colors.grayColor
                              : Colors.whiteColor,
                        },
                      ]}>
                      {item?.message}
                    </RegularText>
                  </View>

                  <View
                    style={[
                      styles.timestampContainer,
                      item?.sender === 'driver'
                        ? styles.alignRight
                        : styles.alignLeft,
                    ]}>
                    <RegularText
                      style={[
                        styles.timestampText,
                        {
                          color:
                            item?.sender === 'driver'
                              ? Colors.grayColor
                              : Colors.primaryColorChat,
                        },
                      ]}>
                      {formatDate(item?.timestamp)}
                    </RegularText>

                    {item?.status === 'pending' ? (
                      <PendingIcon
                        color={
                          item?.sender === 'driver'
                            ? Colors.grayColor
                            : Colors.primaryColorChat
                        }
                        width={16}
                      />
                    ) : (
                      <CheckedIcon
                        color={
                          item?.sender === 'driver'
                            ? Colors.grayColor
                            : Colors.primaryColorChat
                        }
                        width={16}
                      />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                allowFontScaling={false}
                style={styles.input}
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
                ref={inputRef}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!message.trim()}>
                <IconsContainer
                  backgroundColor={Colors.primaryColorChatFaded}
                  IconComponent={SendIcon}
                  iconColor={Colors.primaryColorChat}
                  iconWidth={24}
                  iconHeight={24}
                  padding={18}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.primaryColorChatFadedst,
    padding: 16,
  },
  chatBox: {
    flex: 1,
  },
  lockMessageContainer: {
    backgroundColor: Colors.primaryColorChatFadedst,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  lockMessageText: {
    fontSize: 12,
    color: Colors.primaryColorChat,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 10,
    borderRadius: 4,
    maxWidth: '75%',
    borderRightWidth: 4,
    borderRightColor: Colors.primaryColorChat,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.whiteColor,
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    color: Colors.grayColor,
    fontSize: 13,
  },
  timestampContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: -12,
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  timestampText: {
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.whiteColor,
    marginHorizontal: -16,
    paddingBottom: 32,
    marginBottom: -16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
    padding: 14,
    fontFamily: 'Lufga-Regular',
  },
  sendButton: {},
});

export default ChatPage;
