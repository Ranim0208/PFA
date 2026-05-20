import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EventsProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  Map<DateTime, List<dynamic>> events = {};
  bool loading = false;

  Future<void> fetchEvents(String role, String? regionId) async {
    loading = true;
    notifyListeners();

    try {
      final creathons = await _apiService.getMyCreathons(role, regionId);
      final trainings = await _apiService.getMyTrainings();

      final allEvents = [
        ...creathons.map(
          (e) => Map<String, dynamic>.from(e)..['type'] = 'creathon',
        ),
        ...trainings.map(
          (e) =>
              Map<String, dynamic>.from(e)..['type'] = e['type'] ?? 'formation',
        ),
      ];

      final Map<DateTime, List<dynamic>> eventMap = {};
      for (final event in allEvents) {
        final rawDate = event['dates']?['startDate'] ?? event['startDate'];
        if (rawDate == null) continue;
        final startDate = DateTime.parse(rawDate).toLocal();
        final day = DateTime(startDate.year, startDate.month, startDate.day);
        eventMap[day] = [...(eventMap[day] ?? []), event];
      }

      events = eventMap;
    } catch (e) {
      print('❌ Erreur events: $e');
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
