import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Globe,
  Heart,
  LineChart,
  Lock,
  Medal,
  Palette,
  Shield,
  Smartphone,
  Sparkles,
  Swords,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PublicHeader } from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Check für reduced motion Präferenz
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Custom Hook für Scroll-basierte Animationen mit reduced motion Support
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Optimierter Animated Counter mit reduced motion Support
const AnimatedCounter = memo(function AnimatedCounter({
  end,
  suffix = "",
  duration = 2000,
  label,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  label: string;
}) {
  const [count, setCount] = useState(prefersReducedMotion ? end : 0);
  const { ref, isInView } = useInView();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current || prefersReducedMotion) return;
    hasAnimated.current = true;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} aria-label={`${count}${suffix} ${label}`}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
});

export default function Landing() {
  const { t } = useTranslation();
  const heroRef = useInView();
  const featuresRef = useInView();
  const statsRef = useInView();
  const showcaseRef = useInView();
  const highlightsRef = useInView();
  const ctaRef = useInView();

  // Animation class helper
  const getAnimationClass = useCallback(
    (isInView: boolean, direction: "up" | "left" | "right" = "up") => {
      if (prefersReducedMotion) return "opacity-100";

      const translateClass = {
        up: "translate-y-10",
        left: "-translate-x-10",
        right: "translate-x-10",
      }[direction];

      return isInView
        ? "opacity-100 translate-y-0 translate-x-0"
        : `opacity-0 ${translateClass}`;
    },
    []
  );

  // Stats - realistische Zahlen
  const stats = useMemo(
    () => [
      {
        value: 1250,
        suffix: "+",
        label: t("landing.stats.workouts"),
        icon: Dumbbell,
      },
      {
        value: 48,
        suffix: "",
        label: t("landing.stats.athletes"),
        icon: Users,
      },
      {
        value: 52,
        suffix: "",
        label: t("landing.stats.exercises"),
        icon: Activity,
      },
      {
        value: 100,
        suffix: "%",
        label: t("landing.stats.free"),
        icon: Heart,
      },
    ],
    [t]
  );

  // Haupt-Features (Bento Grid)
  const features = useMemo(
    () => [
      {
        icon: Trophy,
        title: t("landing.features.scoreboard.title"),
        description: t("landing.features.scoreboard.description"),
        gradient: "from-yellow-500/20 to-amber-500/20",
        iconColor: "text-yellow-500",
        hoverBg: "group-hover:bg-yellow-500/10",
        size: "large",
      },
      {
        icon: BarChart3,
        title: t("landing.features.analytics.title"),
        description: t("landing.features.analytics.description"),
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-blue-500",
        hoverBg: "group-hover:bg-blue-500/10",
        size: "small",
      },
      {
        icon: Users,
        title: t("landing.features.friends.title"),
        description: t("landing.features.friends.description"),
        gradient: "from-purple-500/20 to-pink-500/20",
        iconColor: "text-purple-500",
        hoverBg: "group-hover:bg-purple-500/10",
        size: "small",
      },
      {
        icon: Dumbbell,
        title: t("landing.features.training.title"),
        description: t("landing.features.training.description"),
        gradient: "from-green-500/20 to-emerald-500/20",
        iconColor: "text-green-500",
        hoverBg: "group-hover:bg-green-500/10",
        size: "medium",
      },
      {
        icon: Bell,
        title: t("landing.features.notifications.title"),
        description: t("landing.features.notifications.description"),
        gradient: "from-red-500/20 to-rose-500/20",
        iconColor: "text-red-500",
        hoverBg: "group-hover:bg-red-500/10",
        size: "small",
      },
      {
        icon: Smartphone,
        title: t("landing.features.pwa.title"),
        description: t("landing.features.pwa.description"),
        gradient: "from-indigo-500/20 to-violet-500/20",
        iconColor: "text-indigo-500",
        hoverBg: "group-hover:bg-indigo-500/10",
        size: "small",
      },
    ],
    [t]
  );

  // Showcase Features
  const showcaseFeatures = useMemo(
    () => [
      {
        icon: LineChart,
        title: t("landing.showcase.progress.title"),
        description: t("landing.showcase.progress.description"),
      },
      {
        icon: Target,
        title: t("landing.showcase.goals.title"),
        description: t("landing.showcase.goals.description"),
      },
      {
        icon: Calendar,
        title: t("landing.showcase.history.title"),
        description: t("landing.showcase.history.description"),
      },
      {
        icon: Award,
        title: t("landing.showcase.achievements.title"),
        description: t("landing.showcase.achievements.description"),
      },
    ],
    [t]
  );

  // Weitere Highlights
  const highlights = useMemo(
    () => [
      {
        icon: BookOpen,
        title: t("landing.highlights.diary.title"),
        description: t("landing.highlights.diary.description"),
      },
      {
        icon: Swords,
        title: t("landing.highlights.challenges.title"),
        description: t("landing.highlights.challenges.description"),
      },
      {
        icon: Lock,
        title: t("landing.highlights.security.title"),
        description: t("landing.highlights.security.description"),
      },
      {
        icon: Palette,
        title: t("landing.highlights.avatar.title"),
        description: t("landing.highlights.avatar.description"),
      },
      {
        icon: Globe,
        title: t("landing.highlights.languages.title"),
        description: t("landing.highlights.languages.description"),
      },
      {
        icon: Shield,
        title: t("landing.highlights.gdpr.title"),
        description: t("landing.highlights.gdpr.description"),
      },
    ],
    [t]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
      >
        {t("landing.skipToContent")}
      </a>

      <PublicHeader sticky={true} showContactButton={true} />

      <main id="main-content" className="overflow-x-clip">
        {/* Hero Section */}
        <section
          ref={heroRef.ref}
          aria-labelledby="hero-title"
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        >
          {/* Animated Background - respects reduced motion */}
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div
              className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] ${!prefersReducedMotion ? "animate-pulse" : ""}`}
            />
            <div
              className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] ${!prefersReducedMotion ? "animate-pulse" : ""}`}
              style={!prefersReducedMotion ? { animationDelay: "1s" } : {}}
            />

            {/* Floating Elements - hidden when reduced motion */}
            {!prefersReducedMotion && (
              <>
                <div
                  className="absolute top-20 left-[10%] animate-bounce opacity-20"
                  aria-hidden="true"
                >
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div
                  className="absolute top-40 right-[15%] animate-bounce opacity-20"
                  style={{ animationDelay: "0.5s" }}
                  aria-hidden="true"
                >
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <div
                  className="absolute bottom-32 left-[20%] animate-bounce opacity-20"
                  style={{ animationDelay: "1s" }}
                  aria-hidden="true"
                >
                  <Medal className="w-7 h-7 text-primary" />
                </div>
                <div
                  className="absolute bottom-40 right-[10%] animate-bounce opacity-20"
                  style={{ animationDelay: "1.5s" }}
                  aria-hidden="true"
                >
                  <Flame className="w-6 h-6 text-primary" />
                </div>
              </>
            )}
          </div>

          <div className="container mx-auto px-4 py-20 md:py-32">
            <div
              className={`text-center max-w-5xl mx-auto transition-all duration-700 ${getAnimationClass(heroRef.isInView)}`}
            >
              {/* Badge */}
              <Badge
                variant="secondary"
                className="mb-8 px-4 py-2 text-sm font-medium backdrop-blur-sm border-primary/20"
              >
                <Sparkles
                  className={`w-4 h-4 mr-2 text-primary ${!prefersReducedMotion ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
                {t("landing.hero.badge")}
              </Badge>

              {/* Headline */}
              <h1
                id="hero-title"
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
              >
                <span className="block text-foreground">
                  {t("landing.hero.title1")}
                </span>
                <span
                  className={`block bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-transparent ${!prefersReducedMotion ? "bg-[length:200%_auto] animate-gradient" : ""}`}
                >
                  {t("landing.hero.title2")}
                </span>
                <span className="block text-foreground">
                  {t("landing.hero.title3")}
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                {t("landing.hero.description")}
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                role="group"
                aria-label={t("landing.hero.ctaGroup")}
              >
                <Button
                  size="lg"
                  asChild
                  className="group text-lg px-8 py-7 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Link to="/auth/register">
                    {t("landing.hero.cta")}
                    <ArrowRight
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="group text-lg px-8 py-7 border-2 hover:bg-accent/50 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Link to="/auth/login">{t("landing.hero.login")}</Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <ul
                className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground"
                aria-label={t("landing.hero.trustBadges")}
              >
                <li className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                  <Check
                    className="w-4 h-4 text-green-500"
                    aria-hidden="true"
                  />
                  <span>{t("landing.hero.trust1")}</span>
                </li>
                <li className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                  <Shield
                    className="w-4 h-4 text-green-500"
                    aria-hidden="true"
                  />
                  <span>{t("landing.hero.trust2")}</span>
                </li>
                <li className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                  <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>{t("landing.hero.trust3")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Scroll Indicator */}
          {!prefersReducedMotion && (
            <div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
              aria-hidden="true"
            >
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-scroll" />
              </div>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section
          ref={statsRef.ref}
          aria-labelledby="stats-title"
          className="py-20 border-y border-border/40 bg-muted/30 dark:bg-muted/10"
        >
          <div className="container mx-auto px-4">
            <h2 id="stats-title" className="sr-only">
              {t("landing.stats.title")}
            </h2>
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 ${getAnimationClass(statsRef.isInView)}`}
            >
              {stats.map((stat, index) => (
                <article
                  key={index}
                  className="text-center group"
                  style={
                    !prefersReducedMotion
                      ? { transitionDelay: `${index * 100}ms` }
                      : {}
                  }
                >
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300"
                    aria-hidden="true"
                  >
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    <AnimatedCounter
                      end={stat.value}
                      suffix={stat.suffix}
                      label={stat.label}
                    />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section
          id="features"
          ref={featuresRef.ref}
          aria-labelledby="features-title"
          className="py-24 md:py-32 scroll-mt-20"
        >
          <div className="container mx-auto px-4">
            <header
              className={`text-center mb-16 transition-all duration-700 ${getAnimationClass(featuresRef.isInView)}`}
            >
              <Badge variant="outline" className="mb-4">
                <Sparkles
                  className="w-3.5 h-3.5 mr-1.5 text-primary"
                  aria-hidden="true"
                />
                {t("landing.features.badge")}
              </Badge>
              <h2
                id="features-title"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                {t("landing.features.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("landing.features.subtitle")}
              </p>
            </header>

            {/* Bento Grid */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-all duration-700 ${getAnimationClass(featuresRef.isInView)}`}
              role="list"
            >
              {features.map((feature, index) => (
                <Card
                  key={index}
                  role="listitem"
                  className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm ${feature.hoverBg} ${
                    feature.size === "large"
                      ? "md:col-span-2 lg:col-span-1 lg:row-span-2"
                      : feature.size === "medium"
                        ? "md:col-span-2 lg:col-span-2"
                        : ""
                  }`}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    aria-hidden="true"
                  />

                  <CardContent
                    className={`relative p-6 md:p-8 ${feature.size === "large" ? "h-full flex flex-col justify-between" : ""}`}
                  >
                    <div>
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                        aria-hidden="true"
                      >
                        <feature.icon
                          className={`w-7 h-7 ${feature.iconColor}`}
                        />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {feature.size === "large" && (
                      <div
                        className="mt-6 flex items-center text-primary font-medium"
                        aria-hidden="true"
                      >
                        <span>{t("landing.features.learnMore")}</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <section
          id="showcase"
          ref={showcaseRef.ref}
          aria-labelledby="showcase-title"
          className="py-24 md:py-32 bg-muted/30 dark:bg-muted/10 border-y border-border/40 scroll-mt-20"
        >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <div
                className={`transition-all duration-700 ${getAnimationClass(showcaseRef.isInView, "left")}`}
              >
                <Badge variant="outline" className="mb-4">
                  <TrendingUp
                    className="w-3.5 h-3.5 mr-1.5 text-primary"
                    aria-hidden="true"
                  />
                  {t("landing.showcase.badge")}
                </Badge>
                <h2
                  id="showcase-title"
                  className="text-4xl md:text-5xl font-bold text-foreground mb-6"
                >
                  {t("landing.showcase.title")}
                </h2>
                <p className="text-xl text-muted-foreground mb-10">
                  {t("landing.showcase.subtitle")}
                </p>

                <ul className="space-y-6" role="list">
                  {showcaseFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-4 group"
                      style={
                        !prefersReducedMotion
                          ? { transitionDelay: `${index * 100}ms` }
                          : {}
                      }
                    >
                      <div
                        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300"
                        aria-hidden="true"
                      >
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right - App Preview */}
              <div
                className={`relative transition-all duration-700 ${getAnimationClass(showcaseRef.isInView, "right")}`}
                aria-hidden="true"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/20 to-primary/20 rounded-3xl blur-3xl" />

                {/* Mock App Preview */}
                <div className="relative bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-2xl">
                  {/* App Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Sportify
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dashboard
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Live
                    </Badge>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">
                          {t("landing.showcase.preview.streak")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        12 {t("landing.showcase.preview.days")}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">
                          {t("landing.showcase.preview.thisWeek")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        8.5h
                      </div>
                    </div>
                  </div>

                  {/* Progress Chart Mock */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-foreground">
                        {t("landing.showcase.preview.progress")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        +23%
                      </Badge>
                    </div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {t("landing.showcase.preview.workout")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("landing.showcase.preview.today")}
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 border-0">
                        +150 XP
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section - Weitere Features */}
        <section
          id="highlights"
          ref={highlightsRef.ref}
          aria-labelledby="highlights-title"
          className="py-24 md:py-32 scroll-mt-20"
        >
          <div className="container mx-auto px-4">
            <header
              className={`text-center mb-16 transition-all duration-700 ${getAnimationClass(highlightsRef.isInView)}`}
            >
              <Badge variant="outline" className="mb-4">
                <Zap
                  className="w-3.5 h-3.5 mr-1.5 text-primary"
                  aria-hidden="true"
                />
                {t("landing.highlights.badge")}
              </Badge>
              <h2
                id="highlights-title"
                className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              >
                {t("landing.highlights.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("landing.highlights.subtitle")}
              </p>
            </header>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${getAnimationClass(highlightsRef.isInView)}`}
              role="list"
            >
              {highlights.map((highlight, index) => (
                <article
                  key={index}
                  role="listitem"
                  className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"
                    aria-hidden="true"
                  >
                    <highlight.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {highlight.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          ref={ctaRef.ref}
          aria-labelledby="cta-title"
          className="py-24 md:py-32 relative overflow-hidden bg-muted/30 dark:bg-muted/10 border-t border-border/40"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />
          </div>

          <div className="container mx-auto px-4">
            <div
              className={`max-w-4xl mx-auto text-center transition-all duration-700 ${getAnimationClass(ctaRef.isInView)}`}
            >
              <Badge variant="secondary" className="mb-6">
                <Sparkles
                  className="w-3.5 h-3.5 mr-1.5 text-primary"
                  aria-hidden="true"
                />
                {t("landing.cta.badge")}
              </Badge>

              <h2
                id="cta-title"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                {t("landing.cta.title")}
              </h2>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {t("landing.cta.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  asChild
                  className="group text-lg px-10 py-7 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Link to="/auth/register">
                    {t("landing.cta.button")}
                    <ArrowRight
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>

              {/* Trust Elements */}
              <ul
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                aria-label={t("landing.cta.trustLabel")}
              >
                {[
                  {
                    icon: Check,
                    text: t("landing.cta.trust1"),
                    color: "text-green-500",
                  },
                  {
                    icon: Shield,
                    text: t("landing.cta.trust2"),
                    color: "text-blue-500",
                  },
                  {
                    icon: Zap,
                    text: t("landing.cta.trust3"),
                    color: "text-primary",
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50"
                  >
                    <item.icon
                      className={`w-5 h-5 ${item.color}`}
                      aria-hidden="true"
                    />
                    <span className="text-foreground font-medium">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="border-t border-border/40 bg-muted/20 dark:bg-muted/10 py-16 md:py-20"
          role="contentinfo"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25"
                    aria-hidden="true"
                  >
                    <Trophy className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-2xl text-foreground">
                    Sportify
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {t("landing.footer.description")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("landing.footer.madeWith")}{" "}
                  <Heart
                    className="w-4 h-4 inline text-red-500 mx-1"
                    aria-label="Love"
                  />{" "}
                  {t("landing.footer.by")}
                </p>
              </div>

              {/* Features */}
              <nav aria-label={t("landing.footer.features")}>
                <h3 className="font-semibold text-foreground mb-4">
                  {t("landing.footer.features")}
                </h3>
                <ul className="space-y-3">
                  {[
                    {
                      sectionId: "features",
                      label: t("landing.footer.featuresList.scoreboard"),
                    },
                    {
                      sectionId: "features",
                      label: t("landing.footer.featuresList.stats"),
                    },
                    {
                      sectionId: "features",
                      label: t("landing.footer.featuresList.friends"),
                    },
                    {
                      sectionId: "showcase",
                      label: t("landing.footer.featuresList.training"),
                    },
                    {
                      sectionId: "highlights",
                      label: t("landing.footer.featuresList.highlights"),
                    },
                  ].map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => {
                          const element = document.getElementById(
                            item.sectionId
                          );
                          element?.scrollIntoView({
                            behavior: prefersReducedMotion ? "auto" : "smooth",
                            block: "start",
                          });
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded cursor-pointer"
                      >
                        {item.label}
                        <ArrowRight
                          className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Developer */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  {t("landing.footer.developer")}
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>Leon Stadler</li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    React & TypeScript
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4" aria-hidden="true" />
                    {t("landing.footer.tech.modern")}
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <nav aria-label={t("landing.footer.legal")}>
                <h3 className="font-semibold text-foreground mb-4">
                  {t("landing.footer.legal")}
                </h3>
                <ul className="space-y-3">
                  {[
                    {
                      to: "/privacy",
                      label: t("landing.footer.legalLinks.privacy"),
                    },
                    {
                      to: "/terms",
                      label: t("landing.footer.legalLinks.terms"),
                    },
                    {
                      to: "/imprint",
                      label: t("landing.footer.legalLinks.imprint"),
                    },
                    {
                      to: "/contact",
                      label: t("landing.footer.legalLinks.contact"),
                    },
                    {
                      to: "/changelog",
                      label: t("landing.footer.legalLinks.changelog"),
                    },
                  ].map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.to}
                        className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="border-t border-border/40 mt-12 pt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t("landing.footer.copyright")}
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Global Styles for Animations - respects reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            animation: gradient 6s ease infinite;
          }
          @keyframes scroll {
            0%, 100% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(4px); opacity: 0.5; }
          }
          .animate-scroll {
            animation: scroll 1.5s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
}
