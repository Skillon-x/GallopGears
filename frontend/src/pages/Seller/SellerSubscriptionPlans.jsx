return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {defaultPlans.map((plan) => (
          <div
            key={plan.name}
            className={`backdrop-blur-sm bg-white/90 rounded-3xl border shadow-2xl h-full transform transition-all duration-300 hover:scale-[1.02] ${
              plan.name === 'Gallop'
                ? 'border-primary/50 shadow-xl shadow-primary/10'
                : 'border-white/50'
            }`}
          >
            <div className="flex flex-col h-full p-8">
              {/* Plan Header */}
              <div>
                <h3 className="text-xl font-bold text-tertiary">{plan.name}</h3>
                <p className="text-sm text-tertiary/70 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-primary">₹{plan.price}</span>
                  <span className="text-sm text-tertiary/70 ml-1">/ {plan.period}</span>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mt-8 flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-tertiary/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    plan.name === 'Gallop'
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Get Started</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ); 