"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, Shield } from 'lucide-react';
import ShaderBackground from '@/components/ui/shader-background';

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col">
      <ShaderBackground />
      
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            <Shield className="mr-2 h-4 w-4" />
            2025秋季 计算概论B小班课
          </div>
          
          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Learn Python,  
            <span className="ml-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Embraces AI
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="mb-8 text-xl text-gray-200 sm:text-2xl">
            课程内容+进阶延伸
            <br />
            Python + ??
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
              <Link href="/docs/doc">
                <BookOpen className="mr-2 h-5 w-5" />
                文档
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/docs/quiz">
                <Users className="mr-2 h-5 w-5" />
                题目测验
              </Link>
            </Button>
          </div>
          
          {/* Footer Note */}
          <div className="mt-12 text-sm text-gray-400">
            由 Fumadocs 驱动
            <br />
            北京大学学生发展支持项目
            <br />
            By <Link href="https://github.com/wjsoj" className="underline hover:text-white">@wjsoj</Link> 2025
          </div>
        </div>
      </section>
    </main>
  );
}
