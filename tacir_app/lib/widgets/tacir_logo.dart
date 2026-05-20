import 'package:flutter/material.dart';

class TacirLogo extends StatelessWidget {
  final double size;
  const TacirLogo({super.key, this.size = 120});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
    );
  }
}
