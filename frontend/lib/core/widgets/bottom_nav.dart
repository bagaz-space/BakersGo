import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:baker_go/core/theme/app_theme.dart';

class AppBottomNav extends StatelessWidget {
  final int currentIndex; // 0 = Beranda, 1 = Profil, -1 = neither

  const AppBottomNav({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.cardBg)),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => context.go('/home'),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.home,
                      color: currentIndex == 0 ? AppColors.primary : AppColors.textSecondary),
                  Text('Beranda',
                      style: TextStyle(
                          fontSize: 11,
                          color: currentIndex == 0 ? AppColors.primary : AppColors.textSecondary)),
                ],
              ),
            ),
          ),
          FloatingActionButton(
            heroTag: 'main_fab',
            onPressed: () => context.go('/home'),
            backgroundColor: AppColors.primary,
            child: const Icon(Icons.grid_view_rounded, color: Colors.white),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => context.go('/profile'),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.menu,
                      color: currentIndex == 1 ? AppColors.primary : AppColors.textSecondary),
                  Text('Profil',
                      style: TextStyle(
                          fontSize: 11,
                          color: currentIndex == 1 ? AppColors.primary : AppColors.textSecondary)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
