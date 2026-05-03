import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:baker_go/core/theme/app_theme.dart';
import 'package:baker_go/core/widgets/bottom_nav.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(decoration: const BoxDecoration(gradient: AppColors.heroGradient)),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 20, top: 8),
                  child: Align(
                    alignment: Alignment.topRight,
                    child: GestureDetector(
                      onTap: () => context.go('/profile/edit'),
                      child: const Text('Edit',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const CircleAvatar(radius: 50, backgroundColor: Color(0xFFD8D8D8)),
                const SizedBox(height: 12),
                const Text('@UserID',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary)),
                const Text('@Nama Brand / Bakery', style: TextStyle(color: AppColors.primary)),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Email',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                      SizedBox(height: 4),
                      Text('bakeryindo@gmail.com', style: TextStyle(color: AppColors.textSecondary)),
                      Divider(),
                    ],
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.surface,
                      foregroundColor: AppColors.primary,
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                    ),
                    onPressed: () => context.go('/profile/password'),
                    child: const Text('Reset Sandi'),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 1),
    );
  }
}
