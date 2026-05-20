import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';

class EventDetailScreen extends StatelessWidget {
  final Map event;
  final Color color;

  const EventDetailScreen({
    super.key,
    required this.event,
    required this.color,
  });

  String _formatDate(String? raw) {
    if (raw == null) return 'Non défini';
    try {
      final date = DateTime.parse(raw).toLocal();
      return DateFormat('d MMMM yyyy', 'fr').format(date);
    } catch (_) {
      return raw;
    }
  }

  String _getTypeLabel(String? type) {
    switch (type) {
      case 'creathon':
        return 'Créathon';
      case 'formation':
        return 'Formation';
      case 'bootcamp':
        return 'Bootcamp';
      case 'mentorat':
        return 'Mentorat';
      default:
        return 'Événement';
    }
  }

  @override
  Widget build(BuildContext context) {
    final type = event['type'] as String?;
    final startDate = event['dates']?['startDate'] ?? event['startDate'];
    final endDate = event['dates']?['endDate'] ?? event['endDate'];
    final location = event['location'];
    final capacity = event['capacity'];
    final mentors = event['mentors'];
    final jury = event['jury'];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // ─── HEADER ───────────────────────────────
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: color,
            leading: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [color, color.withOpacity(0.7)],
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 40),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _getTypeLabel(type),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          event['title'] ?? 'Sans titre',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ─── CONTENT ──────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Description
                  if (event['description'] != null) ...[
                    _buildSection(
                      icon: Icons.info_outline,
                      title: 'Description',
                      child: Text(
                        event['description'],
                        style: const TextStyle(
                          color: AppColors.textGrey,
                          height: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Dates
                  _buildSection(
                    icon: Icons.calendar_today_outlined,
                    title: 'Dates',
                    child: Column(
                      children: [
                        _buildInfoRow(
                          'Début',
                          _formatDate(startDate),
                          Icons.play_circle_outline,
                          Colors.green,
                        ),
                        if (endDate != null)
                          _buildInfoRow(
                            'Fin',
                            _formatDate(endDate),
                            Icons.stop_circle,
                            Colors.red,
                          ),
                        if (event['dates']?['registrationDeadline'] != null)
                          _buildInfoRow(
                            'Inscription avant',
                            _formatDate(event['dates']['registrationDeadline']),
                            Icons.lock_clock,
                            Colors.orange,
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Lieu
                  if (location != null) ...[
                    _buildSection(
                      icon: Icons.location_on_outlined,
                      title: 'Lieu',
                      child: Column(
                        children: [
                          if (location['venue'] != null)
                            _buildInfoRow(
                              'Lieu',
                              location['venue'],
                              Icons.business,
                              color,
                            ),
                          if (location['city'] != null)
                            _buildInfoRow(
                              'Ville',
                              location['city'],
                              Icons.location_city,
                              color,
                            ),
                          if (location['address'] != null)
                            _buildInfoRow(
                              'Adresse',
                              location['address'],
                              Icons.map_outlined,
                              color,
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Capacité
                  if (capacity != null) ...[
                    _buildSection(
                      icon: Icons.people_outline,
                      title: 'Capacité',
                      child: Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              '${capacity['maxParticipants'] ?? 0}',
                              'Participants',
                              Icons.person_outline,
                              color,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildStatCard(
                              '${capacity['maxTeams'] ?? 0}',
                              'Équipes',
                              Icons.groups_outlined,
                              color,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Équipe
                  if (mentors != null || jury != null) ...[
                    _buildSection(
                      icon: Icons.star_outline,
                      title: 'Équipe',
                      child: Row(
                        children: [
                          if (mentors?['numberOfMentors'] != null)
                            Expanded(
                              child: _buildStatCard(
                                '${mentors['numberOfMentors']}',
                                'Mentors',
                                Icons.school_outlined,
                                AppColors.cardCyan,
                              ),
                            ),
                          if (mentors != null && jury != null)
                            const SizedBox(width: 12),
                          if (jury?['numberOfJuries'] != null)
                            Expanded(
                              child: _buildStatCard(
                                '${jury['numberOfJuries']}',
                                'Jurés',
                                Icons.gavel_outlined,
                                AppColors.cardOrange,
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Statut
                  _buildSection(
                    icon: Icons.flag_outlined,
                    title: 'Statut',
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        event['status'] ?? 'Non défini',
                        style: TextStyle(
                          color: color,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required IconData icon,
    required String title,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primary, size: 18),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                  fontSize: 15,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value,
    IconData icon,
    Color iconColor,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(width: 8),
          Text(
            '$label : ',
            style: const TextStyle(color: AppColors.textGrey, fontSize: 13),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    String value,
    String label,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
