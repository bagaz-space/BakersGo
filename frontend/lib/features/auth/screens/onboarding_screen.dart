import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:baker_go/core/theme/app_theme.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            flex: 6,
            child: Container(
              width: double.infinity,
              color: AppColors.primary,
              child: const Padding(
                padding: EdgeInsets.fromLTRB(24, 60, 24, 0),
                child: Text(
                  'Halo, Bakers!',
                  style: TextStyle(
                    color: AppColors.textOnPrimary,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            flex: 4,
            child: Container(
              width: double.infinity,
              color: AppColors.surface,
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Selamat datang\ndi BakersGo!',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Saatnya naik kelas dari sekarang!',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  const Spacer(),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Column(
                      children: [
                        const Text('Lanjutkan!', style: TextStyle(color: AppColors.primary)),
                        const SizedBox(height: 4),
                        FloatingActionButton(
                          onPressed: () => context.go('/auth'),
                          backgroundColor: AppColors.primary,
                          child: const Icon(Icons.play_arrow, color: Colors.white),
                        ),
                      ],
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
}
