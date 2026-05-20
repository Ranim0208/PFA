import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/notification_provider.dart';
import '../model/app_notification.dart';
import 'notification_banner.dart';

class NotificationOverlay extends StatefulWidget {
  final Widget child;
  const NotificationOverlay({super.key, required this.child});

  @override
  State<NotificationOverlay> createState() => _NotificationOverlayState();
}

class _NotificationOverlayState extends State<NotificationOverlay> {
  AppNotification? _currentBanner;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final provider = context.watch<NotificationProvider>();

    // Afficher le banner si nouvelle notification non lue
    if (provider.notifications.isNotEmpty &&
        !provider.notifications.first.isRead &&
        _currentBanner?.id != provider.notifications.first.id) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _currentBanner = provider.notifications.first;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (_currentBanner != null)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: NotificationBanner(
                notification: _currentBanner!,
                onDismiss: () {
                  if (mounted) {
                    setState(() => _currentBanner = null);
                  }
                },
              ),
            ),
          ),
      ],
    );
  }
}
