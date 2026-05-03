import 'package:flutter/material.dart';
import 'package:baker_go/core/theme/app_theme.dart';
import 'package:baker_go/core/widgets/bottom_nav.dart';

class LaporanScreen extends StatelessWidget {
  const LaporanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Laporan',
            style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.bar_chart_outlined, size: 64, color: AppColors.cardBg),
            SizedBox(height: 12),
            Text('Belum ada laporan.', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: -1),
    );
  }
}
