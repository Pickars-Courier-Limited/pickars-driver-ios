import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MessageHeaders from '../../../Components/Headers/MessageHeaders';
import {Colors} from '../../../Components/Colors/Colors';
import {RegularText} from '../../../Components/Texts/CustomTexts/BaseTexts';
import IconsContainer from '../../../Components/Icons/IconContainer';
import SendIcon from '../../../Components/Icons/SendIcon/SendIcon';
import crm from '../../../../assets/images/crm/crm.png'; // Import the image
import {useRoute} from '@react-navigation/native';
import LockIcon from '../../../Components/Icons/LockIcon/LockIcon';
import {useSocket} from '../../../Context/useSocket';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../Redux/Store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchDriverCustomerMessages, fetchMessagesForUser} from '../../../Redux/Messages/Messages';

interface Message {
  id?: string;
  content: string;
  sender: any;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  read: boolean;
  delivered: boolean;
}
export function formatDate(date: any) {
  // Ensure the date is a valid Date object
  const validDate = new Date(date);
  if (isNaN(validDate.getTime())) {
    // If the date is invalid, return a default or error message
    console.error('Invalid date', date);
    return 'Invalid date';
  }

  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  let day = validDate.getDate();
  let suffix = 'th';

  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';

  return validDate
    .toLocaleString('en-GB', options)
    .replace(day.toString(), `${day}${suffix}`);
}

const MessageSupport: React.FC = () => {
  const {socket} = useSocket(); // Access socket instance from context
  const [type, setType] = useState('');
  const [userId, setUserId] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [messagesFetched, setMessagesFetched] = useState<Message[]>([]);

  useEffect(() => {
    dispatch(fetchDriverCustomerMessages())
      .then(response => {
        setMessagesFetched(response.payload);
        console.log('fetchMessagesForUser messages:', response); // Log the response data
      })
      .catch(error => {
        console.error('Error fetching messages:', error); // Log the error
      });
  }, [dispatch, userId]);

  // Function to fetch user ID from AsyncStorage and log it
  const getUserData = async () => {
    try {
      const tempId = await AsyncStorage.getItem('temp_id');
      const userId = tempId || '';
      socket.emit('sendMessageSupportRoom', userId); // Ensure user joins a room based on userId
      // Use tempId from AsyncStorage if available
      setType('new');
      setUserId(userId); // Set userId from AsyncStorage
    } catch (error) {
      console.error('Error fetching user ID from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello, I'm Neme\nhere to assist you`, // Added line break here
      sender: userId,
      timestamp: new Date().toLocaleTimeString(),
      status: 'read',
      read: false,
      delivered: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  // Reference to the ScrollView to allow scrolling to the end
  const scrollViewRef = useRef<ScrollView>(null);

  // Listen for received support message
  useEffect(() => {
    socket.on('receiveSupportMessage', data => {
      const {userId, type, message, sender} = data;

      // Construct a new message for the frontend
      const newMessage = {
        content: message,
        sender: sender, // Assume the sender is the "other" party
        timestamp: new Date().toLocaleTimeString(),
        status: 'delivered',
        seenSupport: message.seenSupport,
        seenCustomer: message.seenCustomer,
      };

      console.log('Received message:', data);

      // Add the new message to the messages list
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    // Cleanup socket listener when component unmounts
    return () => {
      socket.off('receiveSupportMessage');
    };
  }, [socket, messages]);
  // Scroll to the last message whenever the messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});

      // Update seenCustomer to true for all messages
      const updatedMessages = messages?.map(msg => ({
        ...msg,
        seenCustomer: true,
      }));

      const updatedMessagesFetched = messages?.map(msg => ({
        ...msg,

        seenCustomer: true,
      }));
      socket.emit('updateMessageSeenStatus', {
        userId: userId,
        updatedMessages,
      });
      socket.emit('updateMessageSeenStatus', {
        userId: userId,
        updatedMessagesFetched,
      });
    }
  }, [messages, messagesFetched]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        content: newMessage,
        sender: 'customer',
        timestamp: new Date().toLocaleTimeString(),
        status: 'sent',
        read: false,
        delivered: false,
      };

      //setMessages(prevMessages => [...prevMessages, message]);

      if (userId) {
        socket.emit('sendMessageSupport', {userId, type, message}); // Emit message to server
      }
      inputRef.current?.focus();
      setNewMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <View style={{flex: 1}}>
        <MessageHeaders
          badgeColor={Colors.orangeColor}
          fullName="Neme"
          callBackgroundIconColor={Colors.orangeColorFaded}
          callIconColor={Colors.orangeColor}
          driver={false}
          imageUrl={crm}
          support={true}
        />

        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef} // Assign the ref to ScrollView
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false} // Hide scroll indicator
          >
            <View>
              <View
                style={{
                  backgroundColor: Colors.primaryColorFaded,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  gap: 6,
                  marginBottom: 12,
                }}>
                <LockIcon fill={Colors.primaryColor} width={18} />
                <RegularText style={{fontSize: 12, color: Colors.primaryColor}}>
                  All messages are securely encrypted. Messages are cleared
                  after a 7-day interval.
                </RegularText>
              </View>
              {messagesFetched?.map(item => (
                <View>
                  <View>
                    <View
                      key={item?.id}
                      style={[
                        styles.messageContainer,
                        item?.sender === 'customer'
                          ? styles.myMessage
                          : styles.otherMessage,
                        {
                          backgroundColor:
                            item?.sender === 'customer'
                              ? Colors.whiteColor
                              : Colors.orangeColor,
                        },
                      ]}>
                      <RegularText
                        style={[
                          styles.messageText,
                          {
                            color:
                              item?.sender === 'customer'
                                ? Colors.grayColor
                                : Colors.whiteColor,
                          },
                        ]}>
                        {item?.message}
                      </RegularText>
                    </View>
                    <View
                      style={[
                        {
                          alignSelf:
                            item?.sender === 'customer'
                              ? 'flex-end'
                              : 'flex-start',
                        },
                      ]}>
                      <RegularText
                        style={[
                          styles.timestampText,
                          {
                            color:
                              item?.sender === 'customer'
                                ? Colors.grayColor
                                : Colors.orangeColor,
                          },
                        ]}>
                        {formatDate(item?.timestamp)}
                      </RegularText>
                    </View>
                  </View>
                </View>
              ))}

              {messages?.map(item => (
                <View>
                  <View>
                    <View
                      key={item?.id}
                      style={[
                        styles.messageContainer,
                        item?.sender === 'customer'
                          ? styles.myMessage
                          : styles.otherMessage,
                        {
                          backgroundColor:
                            item?.sender === 'customer'
                              ? Colors.whiteColor
                              : Colors.orangeColor,
                        },
                      ]}>
                      <RegularText
                        style={[
                          styles.messageText,
                          {
                            color:
                              item?.sender === 'customer'
                                ? Colors.grayColor
                                : Colors.whiteColor,
                            // marginTop: 6,
                          },
                        ]}>
                        {item?.content} {/* Ensure this is a string */}
                      </RegularText>
                    </View>
                    <View
                      style={[
                        {
                          alignSelf:
                            item?.sender === 'customer'
                              ? 'flex-end'
                              : 'flex-start',
                        },
                      ]}>
                      <RegularText
                        style={[
                          styles.timestampText,
                          {
                            color:
                              item?.sender === 'customer'
                                ? Colors.grayColor
                                : Colors.orangeColor,
                          },
                        ]}>
                        {item?.timestamp}
                      </RegularText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type your message..."
              value={newMessage}
              onChangeText={setNewMessage}
              allowFontScaling={false}  
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!newMessage.trim()}>
              <IconsContainer
                backgroundColor={Colors.orangeColorFaded}
                IconComponent={SendIcon}
                iconColor={Colors.orangeColor}
                iconWidth={24}
                iconHeight={24}
                padding={18}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.whiteColorF4,
  },
  messagesContainer: {
    paddingBottom: 80,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 8,
    borderRadius: 4,
    maxWidth: '75%',
    borderRightWidth: 4,
    borderRightColor: Colors.primaryColor,
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
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
    padding: 14,
    fontFamily: 'Lufga Regular',
  },
  sendButton: {},
});

export default MessageSupport;
