import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Time "mo:base/Time";

actor {

  type UserEntry    = { username : Text; displayName : Text };
  type Message      = { sender : Text; recipient : Text; text : Text; timestamp : Int };
  type ContactEntry = { owner : Text; contact : Text };

  type ConversationSummary = {
    otherUsername   : Text;
    lastMessage     : Text;
    lastMessageTime : Int;
    unreadCount     : Nat;
  };

  var users        : [UserEntry]    = [];
  var contactEdges : [ContactEntry] = [];
  var allMessages  : [Message]      = [];

  // ── Helpers ───────────────────────────────────────────────────────────

  func findUser(uname : Text) : ?UserEntry {
    var result : ?UserEntry = null;
    for (e in users.vals()) {
      if (e.username == uname) { result := ?e };
    };
    result
  };

  func hasContact(owner : Text, contact : Text) : Bool {
    var found = false;
    for (e in contactEdges.vals()) {
      if (e.owner == owner and e.contact == contact) { found := true };
    };
    found
  };

  func convKey(a : Text, b : Text) : Text {
    if (a < b) { a # "||" # b } else { b # "||" # a }
  };

  // ── Access control stub ────────────────────────────────────────────────

  public func _initializeAccessControlWithSecret(_ : Text) : async () {};

  // ── User registration ──────────────────────────────────────────────────

  public func registerUser(username : Text, displayName : Text) : async { #ok; #err : Text } {
    if (Text.size(username) == 0) return #err("Username cannot be empty");
    let name = if (Text.size(displayName) > 0) displayName else username;
    var updated = false;
    users := Array.map(users, func (e : UserEntry) : UserEntry {
      if (e.username == username) { updated := true; { username; displayName = name } } else e
    });
    if (not updated) {
      users := Array.append(users, [{ username; displayName = name }]);
    };
    #ok
  };

  // ── User search ────────────────────────────────────────────────────────

  // Returns all users (username + displayName) for browsing
  public query func getAllUsers() : async [{ username : Text; displayName : Text }] {
    users
  };

  // Search by prefix/substring — returns empty array if query empty
  public query func findUsersByPrefix(prefix : Text) : async [Text] {
    let q = Text.toLowercase(prefix);
    if (Text.size(q) == 0) return [];
    let buf = Buffer.Buffer<Text>(8);
    for (e in users.vals()) {
      if (Text.contains(Text.toLowercase(e.username), #text q) or
          Text.contains(Text.toLowercase(e.displayName), #text q)) {
        buf.add(e.username);
      };
    };
    Buffer.toArray(buf)
  };

  // ── Contact management ────────────────────────────────────────────────

  public func addContact(callerUsername : Text, targetUsername : Text) : async { #ok; #err : Text } {
    if (callerUsername == targetUsername) return #err("Cannot add yourself");
    if (Option.isNull(findUser(targetUsername))) return #err("User not found");
    if (not hasContact(callerUsername, targetUsername)) {
      contactEdges := Array.append(contactEdges, [{ owner = callerUsername; contact = targetUsername }]);
    };
    #ok
  };

  // ── Messaging ──────────────────────────────────────────────────────────

  public func sendMessage(sender : Text, recipient : Text, text : Text) : async { #ok; #err : Text } {
    if (Text.size(text) == 0) return #err("Empty message");
    allMessages := Array.append(allMessages, [{ sender; recipient; text; timestamp = Time.now() }]);
    if (not hasContact(sender, recipient)) {
      contactEdges := Array.append(contactEdges, [{ owner = sender; contact = recipient }]);
    };
    if (not hasContact(recipient, sender)) {
      contactEdges := Array.append(contactEdges, [{ owner = recipient; contact = sender }]);
    };
    #ok
  };

  public query func getMessagesInConversation(user1 : Text, user2 : Text) : async [{ text : Text; senderUsername : Text; timestamp : Int }] {
    let key = convKey(user1, user2);
    let buf = Buffer.Buffer<{ text : Text; senderUsername : Text; timestamp : Int }>(16);
    for (m in allMessages.vals()) {
      if (convKey(m.sender, m.recipient) == key) {
        buf.add({ text = m.text; senderUsername = m.sender; timestamp = m.timestamp });
      };
    };
    Buffer.toArray(buf)
  };

  public query func listConversationsForUser(username : Text) : async [ConversationSummary] {
    let buf = Buffer.Buffer<ConversationSummary>(8);
    for (edge in contactEdges.vals()) {
      if (edge.owner == username) {
        let other = edge.contact;
        let key   = convKey(username, other);
        var lastMsg  = "";
        var lastTime : Int = 0;
        var unread   : Nat = 0;
        for (m in allMessages.vals()) {
          if (convKey(m.sender, m.recipient) == key) {
            if (m.timestamp > lastTime) { lastTime := m.timestamp; lastMsg := m.text };
            if (m.recipient == username) { unread += 1 };
          };
        };
        buf.add({ otherUsername = other; lastMessage = lastMsg; lastMessageTime = lastTime; unreadCount = unread });
      };
    };
    Buffer.toArray(buf)
  };

  public func markConversationRead(_ : Text, _ : Text) : async () {};

};
