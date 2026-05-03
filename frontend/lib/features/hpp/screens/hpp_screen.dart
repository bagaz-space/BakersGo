import 'package:flutter/material.dart';
import 'package:baker_go/core/theme/app_theme.dart';
import 'package:baker_go/core/widgets/bottom_nav.dart';

class HppScreen extends StatelessWidget {
  const HppScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('HPP',
            style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calculate_outlined, size: 64, color: AppColors.cardBg),
            SizedBox(height: 12),
            Text('Belum ada HPP.', style: TextStyle(color: AppColors.textSecondary)),
            Text('Ketuk + untuk menambah.', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: -1),
    );
  }
}
