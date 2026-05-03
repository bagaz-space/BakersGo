import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:baker_go/core/theme/app_theme.dart';

class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  final _emailController = TextEditingController(text: 'bakeryindo@gmail.com');
  final _userIdController = TextEditingController(text: 'UserID');
  final _brandController = TextEditingController(text: 'Bakery Sukses');

  @override
  void dispose() {
    _emailController.dispose();
    _userIdController.dispose();
    _brandController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(decoration: const BoxDecoration(gradient: AppColors.heroGradient)),
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 20, top: 8),
                    child: Align(
                      alignment: Alignment.topRight,
                      child: GestureDetector(
                        onTap: () => context.go('/profile'),
                        child: const Text('Simpan',
                            style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Stack(
                    children: [
                      const CircleAvatar(radius: 50, backgroundColor: Color(0xFFD8D8D8)),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.primary),
                          ),
                          child: const Icon(Icons.add, size: 20, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text('@UserID',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary)),
                  const Text('@Nama Brand / Bakery', style: TextStyle(color: AppColors.primary)),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Email',
                            style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                        const SizedBox(height: 8),
                        TextField(controller: _emailController),
                        const SizedBox(height: 16),
                        const Text('User ID',
                            style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                        const SizedBox(height: 8),
                        TextField(controller: _userIdController),
                        const SizedBox(height: 16),
                        const Text('Nama Brand / Bakery',
                            style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                        const SizedBox(height: 8),
                        TextField(controller: _brandController),
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
