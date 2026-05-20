class AppNotification {
  final String id;
  final String title;
  final String body;
  final DateTime date;
  final String? eventId;
  final String? eventType;
  bool isRead;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.date,
    this.eventId,
    this.eventType,
    this.isRead = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'body': body,
    'date': date.toIso8601String(),
    'eventId': eventId,
    'eventType': eventType,
    'isRead': isRead,
  };

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      AppNotification(
        id: json['id'],
        title: json['title'],
        body: json['body'],
        date: DateTime.parse(json['date']),
        eventId: json['eventId'],
        eventType: json['eventType'],
        isRead: json['isRead'] ?? false,
      );
}
