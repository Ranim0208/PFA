import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:tacir_app/providers/events_provider.dart';
import '../constants/colors.dart';
import '../providers/auth_provider.dart';
import '../providers/notification_provider.dart';
import '../services/notification_service.dart';
import '../widgets/event_card.dart';
import '../widgets/tacir_logo.dart';
import 'notification_preferences_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';
import 'output_stats_screen.dart';
import 'dart:async';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  bool _showMonthView = false;
  DateTime _weekStart = DateTime.now().subtract(
    Duration(days: DateTime.now().weekday - 1),
  );
  DateTime _selectedDay = DateTime.now();
  int _currentIndex = 0;
  Timer? _refreshTimer;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initNotifications();
      _loadEvents();
    });

    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _loadEvents();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    final auth = context.read<AuthProvider>();
    await context.read<EventsProvider>().fetchEvents(
      auth.userRole ?? '',
      auth.regionId,
    );
  }

  Future<void> _initNotifications() async {
    final auth = context.read<AuthProvider>();
    if (auth.userId != null) {
      final notifService = NotificationService();
      await notifService.initialize(auth.userId!, context);
      // Charger l'historique des notifications pour cet utilisateur
      await context.read<NotificationProvider>().loadNotifications(
        auth.userId!,
      );
    }
  }

  Color _getEventColor(String? type) {
    switch (type) {
      case 'creathon':
        return AppColors.cardPink;
      case 'formation':
        return AppColors.cardPurple;
      case 'bootcamp':
        return AppColors.cardOrange;
      case 'mentorat':
        return AppColors.cardCyan;
      default:
        return AppColors.cardPurple;
    }
  }

  void _onDaySelected(DateTime day) {
    setState(() {
      _selectedDay = day;
    });
  }

  bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  DateTime _normalizeDate(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  // ✅ Pass events as parameter
  Widget _buildMonthView(Map<DateTime, List<dynamic>> events) {
    final firstDay = DateTime(_selectedDay.year, _selectedDay.month, 1);
    final lastDay = DateTime(_selectedDay.year, _selectedDay.month + 1, 0);
    final startOffset = firstDay.weekday - 1;
    final totalDays = lastDay.day;
    final dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: dayNames
              .map(
                (d) => SizedBox(
                  width: 36,
                  child: Text(
                    d,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textGrey,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            mainAxisSpacing: 4,
            crossAxisSpacing: 4,
            childAspectRatio: 1,
          ),
          itemCount: startOffset + totalDays,
          itemBuilder: (context, index) {
            if (index < startOffset) return const SizedBox();
            final day = DateTime(
              _selectedDay.year,
              _selectedDay.month,
              index - startOffset + 1,
            );
            final isSelected = isSameDay(day, _selectedDay);
            final isToday = isSameDay(day, DateTime.now());
            final normalizedDay = _normalizeDate(day);
            final hasEvent = events[normalizedDay] != null;

            return GestureDetector(
              onTap: () => _onDaySelected(day),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary
                      : isToday
                      ? AppColors.primary.withOpacity(0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Text(
                      '${day.day}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isSelected || isToday
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: isSelected ? Colors.white : AppColors.textDark,
                      ),
                    ),
                    if (hasEvent)
                      Positioned(
                        bottom: 4,
                        child: Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.white
                                : AppColors.secondary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // ✅ Pass events as parameter
  Widget _buildWeekView(Map<DateTime, List<dynamic>> events) {
    final dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(7, (i) {
        final day = _weekStart.add(Duration(days: i));
        final isSelected = isSameDay(day, _selectedDay);
        final normalizedDay = _normalizeDate(day);
        final hasEvent = events[normalizedDay] != null;

        return GestureDetector(
          onTap: () => _onDaySelected(day),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 40,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text(
                  dayNames[i],
                  style: TextStyle(
                    fontSize: 12,
                    color: isSelected ? Colors.white70 : AppColors.textGrey,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${day.day}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: hasEvent
                        ? (isSelected ? Colors.white : AppColors.secondary)
                        : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  // ─── BODY ROUTER ──────────────────────────────
  Widget _buildBody() {
    final role = context.watch<AuthProvider>().userRole ?? '';
    // Onglet Livrables (index 2) uniquement pour incubationCoordinator
    if (role == 'IncubationCoordinator' && _currentIndex == 2) {
      return const OutputStatsScreen();
    }
    // Onglet Profil (index 1)
    if (_currentIndex == 1) {
      return const SafeArea(child: ProfileScreen());
    }
    // Onglet Accueil (index 0)
    return SafeArea(child: _buildHomePage());
  }

  // ─── PAGE HOME ────────────────────────────────
  Widget _buildHomePage() {
    final auth = context.watch<AuthProvider>();
    final eventsProvider = context.watch<EventsProvider>();
    final events = eventsProvider.events;
    final loading = eventsProvider.loading;
    final now = DateTime.now();

    // ✅ Get selected day events from provider (auto-updates!)
    final normalizedSelectedDay = _normalizeDate(_selectedDay);
    final selectedEvents = events[normalizedSelectedDay] ?? [];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const TacirLogo(size: 48),
                  Row(
                    children: [
                      // Notification bell avec badge
                      GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const NotificationsScreen(),
                          ),
                        ),
                        child: Stack(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.notifications_outlined,
                                color: AppColors.primary,
                              ),
                            ),
                            Consumer<NotificationProvider>(
                              builder: (context, provider, _) {
                                if (provider.unreadCount == 0) {
                                  return const SizedBox();
                                }
                                return Positioned(
                                  right: 0,
                                  top: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: AppColors.secondary,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${provider.unreadCount}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Settings
                      GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => NotificationPreferencesScreen(
                              userId: auth.userId ?? '',
                            ),
                          ),
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.settings_outlined,
                            color: AppColors.textGrey,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Bonjour, ${auth.userName?.split(' ').first ?? 'vous'} 👋',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                DateFormat('MMMM yyyy', 'fr').format(_selectedDay),
                style: const TextStyle(color: AppColors.textGrey),
              ),
              const SizedBox(height: 16),

              // Toggle semaine/mois
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () {
                      setState(() {
                        if (_showMonthView) {
                          _selectedDay = DateTime(
                            _selectedDay.year,
                            _selectedDay.month - 1,
                            1,
                          );
                        } else {
                          _weekStart = _weekStart.subtract(
                            const Duration(days: 7),
                          );
                          _selectedDay = _weekStart;
                        }
                      });
                    },
                    icon: const Icon(
                      Icons.chevron_left,
                      color: AppColors.primary,
                    ),
                  ),
                  GestureDetector(
                    onTap: () =>
                        setState(() => _showMonthView = !_showMonthView),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _showMonthView
                                ? Icons.calendar_month
                                : Icons.calendar_view_week,
                            color: AppColors.primary,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _showMonthView ? 'Mois' : 'Semaine',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      setState(() {
                        if (_showMonthView) {
                          _selectedDay = DateTime(
                            _selectedDay.year,
                            _selectedDay.month + 1,
                            1,
                          );
                        } else {
                          _weekStart = _weekStart.add(const Duration(days: 7));
                          _selectedDay = _weekStart;
                        }
                      });
                    },
                    icon: const Icon(
                      Icons.chevron_right,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // ✅ Vue semaine ou mois - pass events as parameter
              if (!_showMonthView)
                _buildWeekView(events)
              else
                _buildMonthView(events),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // ✅ Events list - now using selectedEvents from provider
        Expanded(
          child: RefreshIndicator(
            color: AppColors.primary,
            onRefresh: _loadEvents,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                    child: Text(
                      selectedEvents.isEmpty
                          ? 'Aucun événement'
                          : 'Programme du ${DateFormat('d MMMM', 'fr').format(_selectedDay)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                  ),
                  Expanded(
                    child: selectedEvents.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.event_available,
                                  size: 56,
                                  color: Colors.grey.shade200,
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'Aucun événement ce jour',
                                  style: TextStyle(color: Colors.grey.shade400),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            itemCount: selectedEvents.length,
                            itemBuilder: (context, index) {
                              final event = selectedEvents[index];
                              return EventCard(
                                event: event,
                                color: _getEventColor(event['type'] as String?),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final eventsProvider = context.watch<EventsProvider>();
    final loading = eventsProvider.loading;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : _buildBody(),

      // ─── BOTTOM NAV ───────────────────────────
      bottomNavigationBar: Builder(
        builder: (context) {
          final role = context.watch<AuthProvider>().userRole ?? '';
          final isIncubation = role == 'IncubationCoordinator';
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (i) => setState(() => _currentIndex = i),
              backgroundColor: Colors.white,
              selectedItemColor: AppColors.primary,
              unselectedItemColor: AppColors.textGrey,
              showSelectedLabels: true,
              showUnselectedLabels: true,
              elevation: 0,
              items: [
                const BottomNavigationBarItem(
                  icon: Icon(Icons.home_outlined),
                  activeIcon: Icon(Icons.home),
                  label: 'Accueil',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline),
                  activeIcon: Icon(Icons.person),
                  label: 'Profil',
                ),
                if (isIncubation)
                  const BottomNavigationBarItem(
                    icon: Icon(Icons.assignment_turned_in_outlined),
                    activeIcon: Icon(Icons.assignment_turned_in_rounded),
                    label: 'Livrables',
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
