import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../constants/colors.dart';
import '../widgets/tacir_logo.dart';

class OutputStatsScreen extends StatefulWidget {
  const OutputStatsScreen({super.key});

  @override
  State<OutputStatsScreen> createState() => _OutputStatsScreenState();
}

class _OutputStatsScreenState extends State<OutputStatsScreen> {
  List<dynamic> _stats = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final apiService = ApiService();
      final data = await apiService.getIncubationOutputStats();
      setState(() {
        _stats = data;
        _loading = false;
      });
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final msg = e.response?.data?.toString() ?? e.message;
      debugPrint('DioException: $status | $msg');
      setState(() {
        _error = 'Erreur $status: $msg';
        _loading = false;
      });
    } catch (e) {
      debugPrint('Erreur: $e');
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Color _rateColor(int rate) {
    if (rate >= 75) return const Color(0xFF4CAF50);
    if (rate >= 50) return const Color(0xFFFF9800);
    return const Color(0xFFE53935);
  }

  String _typeLabel(String type) {
    switch (type) {
      case 'formation':
        return 'Formation';
      case 'bootcamp':
        return 'Bootcamp';
      case 'mentoring':
        return 'Mentorat';
      default:
        return type;
    }
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'formation':
        return AppColors.cardPurple;
      case 'bootcamp':
        return AppColors.cardOrange;
      case 'mentoring':
        return AppColors.cardCyan;
      default:
        return AppColors.primary;
    }
  }

  String _deadlineLabel(int days, bool isOverdue) {
    if (isOverdue) return 'Expiré';
    if (days == 0) return "Aujourd'hui";
    if (days == 1) return 'Demain';
    return 'J-$days';
  }

  @override
  Widget build(BuildContext context) {
    final critical = _stats.where((s) => s['isCritical'] == true).toList();
    final others = _stats.where((s) => s['isCritical'] != true).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Header custom (même style que ProfileScreen)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(
              children: [
                const TacirLogo(size: 36),
                const SizedBox(width: 12),
                const Text(
                  'Suivi des livrables',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.refresh_rounded),
                  onPressed: _fetchStats,
                  color: AppColors.primary,
                  iconSize: 26,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Contenu
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: _loading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    )
                  : _error != null
                  ? _buildError()
                  : _stats.isEmpty
                  ? _buildEmpty()
                  : RefreshIndicator(
                      onRefresh: _fetchStats,
                      color: AppColors.primary,
                      child: ListView(
                        padding: const EdgeInsets.all(20),
                        children: [
                          // Résumé global
                          _buildSummaryCard(),
                          const SizedBox(height: 20),

                          // Livrables critiques
                          if (critical.isNotEmpty) ...[
                            _buildSectionHeader(
                              '⚠️ Critiques — deadline proche & taux bas',
                              const Color(0xFFE53935),
                            ),
                            const SizedBox(height: 8),
                            ...critical.map((s) => _buildOutputCard(s)),
                            const SizedBox(height: 20),
                          ],

                          // Autres livrables
                          if (others.isNotEmpty) ...[
                            _buildSectionHeader(
                              '📋 Tous les livrables',
                              AppColors.textGrey,
                            ),
                            const SizedBox(height: 8),
                            ...others.map((s) => _buildOutputCard(s)),
                          ],
                        ],
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard() {
    final total = _stats.length;
    final critical = _stats.where((s) => s['isCritical'] == true).length;
    final avgRate = total > 0
        ? (_stats.fold<int>(0, (sum, s) => sum + (s['submissionRate'] as int)) /
                  total)
              .round()
        : 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF9C6FFF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          _summaryItem('$total', 'Livrables', Colors.white),
          _divider(),
          _summaryItem('$avgRate%', 'Taux moyen', Colors.white),
          _divider(),
          _summaryItem(
            '$critical',
            'Critiques',
            critical > 0 ? const Color(0xFFFFCC02) : Colors.white,
          ),
        ],
      ),
    );
  }

  Widget _summaryItem(String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: color.withOpacity(0.8)),
          ),
        ],
      ),
    );
  }

  Widget _divider() =>
      Container(width: 1, height: 40, color: Colors.white.withOpacity(0.3));

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildOutputCard(Map<String, dynamic> s) {
    final rate = s['submissionRate'] as int;
    final submitted = s['totalSubmitted'] as int;
    final expected = s['totalExpected'] as int;
    final days = s['daysUntilDue'] as int;
    final isOverdue = s['isOverdue'] as bool;
    final isCritical = s['isCritical'] as bool;
    final type = s['trainingType'] as String? ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: isCritical
            ? Border.all(
                color: const Color(0xFFE53935).withOpacity(0.4),
                width: 1.5,
              )
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Text(
                    s['title'],
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
                if (isCritical)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      '⚠️ Critique',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFFE53935),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),

            // Formation + deadline
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _typeColor(type).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    _typeLabel(type),
                    style: TextStyle(
                      fontSize: 11,
                      color: _typeColor(type),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    s['trainingTitle'],
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textGrey,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isOverdue
                        ? const Color(0xFFFFEBEE)
                        : days <= 3
                        ? const Color(0xFFFFF3E0)
                        : const Color(0xFFF3F3F3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    _deadlineLabel(days, isOverdue),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isOverdue
                          ? const Color(0xFFE53935)
                          : days <= 3
                          ? const Color(0xFFFF9800)
                          : AppColors.textGrey,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Barre de progression
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '$submitted / $expected soumissions',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textGrey,
                            ),
                          ),
                          Text(
                            '$rate%',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: _rateColor(rate),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: expected > 0 ? submitted / expected : 0,
                          minHeight: 7,
                          backgroundColor: const Color(0xFFEEEEEE),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _rateColor(rate),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Date exacte
            const SizedBox(height: 8),
            Text(
              'Date limite : ${DateFormat('dd/MM/yyyy', 'fr').format(DateTime.parse(s['dueDate']))}',
              style: const TextStyle(fontSize: 11, color: AppColors.textGrey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 48,
              color: AppColors.cardPink,
            ),
            const SizedBox(height: 12),
            const Text(
              'Erreur de chargement',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _fetchStats,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.assignment_outlined,
              size: 56,
              color: AppColors.textGrey,
            ),
            SizedBox(height: 12),
            Text(
              'Aucun livrable trouvé',
              style: TextStyle(color: AppColors.textGrey),
            ),
          ],
        ),
      ),
    );
  }
}

// Wrapper minimal pour lire le token sans instancier ApiService
class FlutterSecureStorageWrapper {
  const FlutterSecureStorageWrapper();
  Future<String?> read({required String key}) async {
    final storage = FlutterSecureStorage();
    return storage.read(key: key);
  }
}
